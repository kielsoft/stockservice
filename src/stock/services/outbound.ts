import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Outbound, OutboundItem, Status, WarehouseLocationItem } from '../entities';
import { OutboundCreateInput, OutboundItemCreateInput, OutboundFetchInput, 
    OutboundFetchResponseData, OutboundItemFetchInput, OutboundItemFetchResponseData, OutboundPickInput, RequisitionData } from '../dtos';
import { OutboundPickError } from '../../errors';
import { WarehouseLocationItemService } from './warehouse_location_item';
import { buildPaginationWithData, itemArrayToObject } from './base';


@Injectable()
export class OutboundService  {

    constructor(
        @InjectRepository(Outbound) private readonly repo: Repository<Outbound>,
        @InjectRepository(OutboundItem) private readonly itemRepo: Repository<OutboundItem>,
        private readonly locationItemRepo: WarehouseLocationItemService,
    ) {}

    async create(outbound: OutboundCreateInput): Promise<Outbound> {
        outbound.statusCode = Status.CODE.approved;
        let items = outbound.items;
        delete outbound.items;

        //verify quantity
        // for (let index = 0; index < items.length; index++) {
        //     const item = items[index];
        //     await this.locationItemRepo.getOne({warehouseLocationId: item.warehouseLocationId, sku: item.sku}).then(warehouseLocationItem => {
        //         if(warehouseLocationItem.qty < item.qty) throw OutboundPickError("Insufficient quantity"); 
        //     }).catch(error => {
        //         if(error.name == 'EntityNotFound')throw OutboundPickError(`Error scan qty for SKU: ${item.sku} in locationId: ${item.warehouseLocationId}`);
        //         throw error;
        //     });
        // }

        return this.repo.save(outbound).then(async receipt => {
            await items.map(async outboundItem => await this.saveItem({...outboundItem, outboundId: receipt.id}));
            return this.getOne(receipt);
        }).catch(error => {
            throw error;
        });
    }

    saveItem(item: OutboundItemCreateInput & {outboundId: number}){
        return this.itemRepo.save(item);
    }

    pickAndRelease(input: OutboundPickInput): Promise<Outbound>{
        return this.getOne({id: input.id}).then(async outbound => {

            if(outbound.statusCode == Status.CODE.completed){
                throw new Error(`Outbound: ${outbound.id} already picked and release`);
            }

            if(input.items.length > outbound.items.length){
                throw new Error("Invalid number of items");
            }

            let grnItems = itemArrayToObject<OutboundItem>(outbound.items);
            let inputWarehouseLocationItems: {[key: string]: WarehouseLocationItem } = {}; 
            for (let i = 0; i < input.items.length; i++) {
                let inputItem = input.items[i];
                let item: OutboundItem = grnItems[inputItem.sku];

                if(!item || !item.id) {
                    throw new Error(`Item with SKU ${inputItem.sku} does not belong to this Request`);
                }
                else if( item.pickerId ) {
                    throw new Error(`SKU ${item.sku} with ${item.qty} qty already picked from Location ${inputItem.warehouseLocationId}`);
                } else if(inputItem.qty !== item.qty){
                    throw new Error(`Qty mismatch for SKU: ${item.sku}`);
                }

                const warehouseLocationItem = await this.locationItemRepo.getOne({
                    sku: item.sku,
                    warehouseLocationId: inputItem.warehouseLocationId,
                })
                // ***************************************** 
                // Remove this later
                // ***************************************** 
                .catch((error) => {
                    return this.locationItemRepo.create({
                        name: `Product-${item.sku}`,
                        description: outbound.remark,
                        warehouseLocationId: inputItem.warehouseLocationId,
                        sku: item.sku,
                        qty: item.qty * 3,
                    });
                });

                if(!warehouseLocationItem || !warehouseLocationItem.id) {
                    throw new Error(`Item with SKU ${inputItem.sku} is not available in Location: ${inputItem.warehouseLocationId}`);
                } else if (warehouseLocationItem.qty < item.qty){
                    throw new Error(`Item with SKU ${inputItem.sku} has insufficient qty in Location: ${inputItem.warehouseLocationId}`);
                }

                inputWarehouseLocationItems[item.sku] = warehouseLocationItem;
            }

            for (let i = 0; i < input.items.length; i++) {
                let inputItem = input.items[i];
                let item: OutboundItem = grnItems[inputItem.sku];

                item.pickerId = input.pickerId;
                item.warehouseLocationId = inputItem.warehouseLocationId;
                item.save();
                
                const warehouseLocationItem = inputWarehouseLocationItems[item.sku];
                this.locationItemRepo.update({...warehouseLocationItem, qty: (warehouseLocationItem.qty-item.qty)});
            }

            if(outbound.items.length && !(outbound.items.filter(i => !i.pickerId)).length){
                outbound.statusCode = Status.CODE.completed;
            }

            return outbound.save();

        }).catch(error => {
            if(String(error.code).indexOf('ER_NO_REFERENCED') >= 0){
                throw OutboundPickError("Invalid warehouse ID or SKU, please check and try again");
            }
            throw OutboundPickError(error.message)
        });
    }

    getOne(outbound: OutboundFetchInput): Promise<Outbound> {
        return this.repo.findOneOrFail(outbound, {relations: ["warehouse", "items",]});
    }

    async fetchAll(outbound: OutboundFetchInput): Promise<OutboundFetchResponseData> {
        let pagination = outbound && outbound.pagination || {limit: 50, page: 1};
        let skip = (pagination.page > 1)? (pagination.page-1) * pagination.limit : 0;

        if(outbound && outbound.pagination) delete outbound.pagination;
        
        let [data, total] = await this.repo.findAndCount({
            where: outbound, 
            relations: ["warehouse", "items"],
            take: pagination.limit,
            skip: skip
        }).catch(error => {
            throw new Error("Error fetching Outbounds")
        })

        return buildPaginationWithData(data, total, pagination as any);
    }
    
    async fetchAllItems(item: OutboundItemFetchInput): Promise<OutboundItemFetchResponseData> {
        let pagination = item && item.pagination || {limit: 50, page: 1};
        let skip = (pagination.page > 1)? (pagination.page-1) * pagination.limit : 0;
        
        if(item && item.pagination) delete item.pagination;

        let [data, total] = await this.itemRepo.findAndCount({
            where: item, 
            relations: ["outbound", "warehouseLocation"],
            take: pagination.limit,
            skip: skip
        }).catch(error => {
            throw new Error("Error fetching GRN items")
        })

        return buildPaginationWithData(data, total, pagination as any);
    }

    generateRequisitionRequest(data: RequisitionData[], userId: number): Promise<OutboundFetchResponseData> {
        const firstData = data[0];
        if(!firstData?.requestNo) {
            throw OutboundPickError('Invalid Requisition Number');
        }

        const request = {
            warehouseId: 1,
            requestNo: firstData.requestNo,
            remark: `${firstData.reason}. ${firstData.detail}`,
            userId,
            statusCode: Status.CODE.approved,
            items: [],
        }

        data.forEach(i => {
            request.items.push({
                sku: i.sku,
                qty: i.qty
            });
        });

        return this.create(request)
        .then(outbound => this.fetchAll({requestNo: firstData.requestNo}));
    }
    
}

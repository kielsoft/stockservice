import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Outbound, OutboundItem, Status } from '../entities';
import { OutboundCreateInput, OutboundItemCreateInput, OutboundFetchInput, 
    OutboundFetchResponseData, OutboundItemFetchInput, OutboundItemFetchResponseData, OutboundPickInput } from '../dtos';
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
        outbound.statusCode = Status.CODE.received;
        let items = outbound.items;
        delete outbound.items;

        //verify quantity
        for (let index = 0; index < items.length; index++) {
            const item = items[index];
            await this.locationItemRepo.getOne({warehouseLocationId: item.warehouseLocationId, sku: item.sku}).then(warehouseLocationItem => {
                if(warehouseLocationItem.qty < item.qty) throw OutboundPickError("Insufficient quantity"); 
            }).catch(error => {
                if(error.name == 'EntityNotFound')throw OutboundPickError(`Error scan qty for SKU: ${item.sku} in locationId: ${item.warehouseLocationId}`);
                throw error;
            });
        }

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

            if(outbound.items.length != input.items.length){
                throw new Error("Invalid number of items");
            }

            let inputItems = itemArrayToObject<OutboundItemCreateInput>(input.items);

            for (let i = 0; i < outbound.items.length; i++) {
                let item = outbound.items[i];

                let pickItem: OutboundItemCreateInput = inputItems[item.sku];
                if(!pickItem) {
                    throw new Error("Invalid list of items");
                }
                else if(pickItem.qty !== item.qty){
                    throw new Error(`Qty mismatch for sku: ${item.sku}`);
                }
            }

            outbound.items.forEach(async item => {
                const warehouseLocationItem = await this.locationItemRepo.getOne({
                    sku: item.sku,
                    warehouseLocationId: item.warehouseLocationId,
                })
                this.locationItemRepo.update({...warehouseLocationItem, qty: (warehouseLocationItem.qty-item.qty)});
            })

            delete input.items;
            outbound.load(input);
            outbound.statusCode = Status.CODE.completed;
            return outbound.save();

        }).catch(error => {
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

        return {
            data, 
            count: data.length,
            limit: pagination.limit,
            page: pagination.page,
            pages: Number((total/pagination.limit).toFixed())
        }
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
    
}

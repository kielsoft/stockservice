import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inbound, InboundItem, Status } from '../entities';
import { InboundCreateInput, InboundItemCreateInput, InboundUpdateInput, 
    InboundFetchInput, InboundPutAwayInput, InboundItemPutAwayInput, 
    InboundFetchResponseData, InboundItemFetchInput, InboundItemFetchResponseData } from '../dtos';
import { InboundPutAwayError } from '../../errors';
import { WarehouseLocationItemService } from './warehouse_location_item';
import { buildPaginationWithData, itemArrayToObject } from './base';


@Injectable()
export class InboundService  {

    constructor(
        @InjectRepository(Inbound) private readonly repo: Repository<Inbound>,
        @InjectRepository(InboundItem) private readonly itemRepo: Repository<InboundItem>,
        private readonly locationItemRepo: WarehouseLocationItemService,
    ) {}

    async create(inbound: InboundCreateInput): Promise<Inbound> {
        inbound.statusCode = Status.CODE.received;
        let items = inbound.items;
        delete inbound.items;
        return this.repo.save(inbound).then(receipt => {
            items.map(async inboundItem => await this.saveItem({...inboundItem, inboundId: receipt.id}));
            return this.getOne(receipt);
        });
    }

    saveItem(item: InboundItemCreateInput & {inboundId: number}){
        return this.itemRepo.save(item);
    }
    
    update(inboundInput: InboundUpdateInput): Promise<Inbound> {
        return this.repo.save(inboundInput).then(inbound => this.getOne(inbound))
    }

    putAway(putAwayInput: InboundPutAwayInput): Promise<Inbound>{
        return this.getOne({id: putAwayInput.id}).then(async inbound => {

            if(inbound.statusCode == Status.CODE.completed){
                throw new Error(`GRN: ${inbound.id} already put away`);
            }

            if(inbound.items.length != putAwayInput.items.length){
                throw new Error("Invalid number of items");
            }

            let inputItems = itemArrayToObject<InboundItemPutAwayInput>(putAwayInput.items);

            for (let i = 0; i < inbound.items.length; i++) {
                let item = inbound.items[i];

                let inPutAwayItem: InboundItemPutAwayInput = inputItems[item.sku];
                if(!inPutAwayItem) {
                    throw new Error("Invalid list of items");
                }
                else if(inPutAwayItem.qty !== item.qty){
                    throw new Error(`Qty mismatch for sku: ${item.sku}`);
                }
                item.warehouseLocationId = inPutAwayItem.warehouseLocationId;
                await item.save();
            }

            

            inbound.items.forEach(async item => {
                const warehouseLocationItem = await this.locationItemRepo.getOne({
                    sku: item.sku,
                    warehouseLocationId: item.warehouseLocationId,
                }).catch((error) => {
                    return this.locationItemRepo.create({
                        name: item.name || null,
                        description: item.description || null,
                        warehouseLocationId: item.warehouseLocationId,
                        sku: item.sku,
                        qty: 0,
                    });
                })
                this.locationItemRepo.update({...warehouseLocationItem, qty: (warehouseLocationItem.qty+item.qty)})
            })

            delete putAwayInput.items;
            inbound.load(putAwayInput);
            inbound.statusCode = Status.CODE.completed;
            return inbound.save();

        }).catch(error => {
            throw InboundPutAwayError(error.message)
        });
    }

    getOne(inbound: InboundFetchInput): Promise<Inbound> {
        return this.repo.findOneOrFail(inbound, {relations: ["warehouse", "items",]});
    }

    async fetchAll(inbound: InboundFetchInput): Promise<InboundFetchResponseData> {
        let pagination = inbound && inbound.pagination || {limit: 50, page: 1};
        let skip = (pagination.page > 1)? (pagination.page-1) * pagination.limit : 0;

        if(inbound && inbound.pagination) delete inbound.pagination;
        
        let [data, total] = await this.repo.findAndCount({
            where: inbound, 
            relations: ["warehouse", "items"],
            take: pagination.limit,
            skip: skip
        }).catch(error => {
            throw new Error("Error fetching GRNs")
        })

        return buildPaginationWithData(data, total, pagination as any);
    }
    
    async fetchAllItems(item: InboundItemFetchInput): Promise<InboundItemFetchResponseData> {
        let pagination = item && item.pagination || {limit: 50, page: 1};
        let skip = (pagination.page > 1)? (pagination.page-1) * pagination.limit : 0;

        if(item && item.pagination) delete item.pagination;
        
        let [data, total] = await this.itemRepo.findAndCount({
            where: item, 
            relations: ["inbound", "warehouseLocation"],
            take: pagination.limit,
            skip: skip
        }).catch(error => {
            throw new Error("Error fetching GRN items")
        })

        return buildPaginationWithData(data, total, pagination as any);
    }
    
}

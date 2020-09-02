import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inbound, InboundItem, WarehouseLocationItem } from '../entities';
import { InboundCreateInput, InboundItemCreateInput, InboundUpdateInput, InboundFetchInput, InboundPutAwayInput, InboundItemPutAwayInput } from '../dtos';
import { InboundPutAwayError } from '../../errors';


@Injectable()
export class InboundService  {

    constructor(
        @InjectRepository(Inbound) private readonly repo: Repository<Inbound>,
        @InjectRepository(InboundItem) private readonly itemRepo: Repository<InboundItem>,
        @InjectRepository(WarehouseLocationItem) private readonly locationItemRepo: Repository<WarehouseLocationItem>,
    ) {}

    async create(inbound: InboundCreateInput): Promise<Inbound> {
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
            if(inbound.items.length != putAwayInput.items.length){
                throw new Error("Invalid number of items");
            }

            let inputItems = this.itemArrayToObject<InboundItemPutAwayInput>(putAwayInput.items);

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

            delete putAwayInput.items;
            inbound.load(putAwayInput);
            inbound.statusCode = "completed"

            return inbound.save().then(inbound => {
                inbound.items.forEach(item => {
                    let i = this.cloneData(item);
                    delete i.createdAt;
                    delete i.updatedAt;
                    this.locationItemRepo.save(i);
                })
                return inbound;
            });
        }).catch(error => {
            throw InboundPutAwayError(error.message)
        });
    }

    getOne(inbound: InboundFetchInput): Promise<Inbound> {
        return this.repo.findOneOrFail(inbound, {relations: ["items", "items.warehouseLocation", 'warehouse']});
    }

    fetchAll(inbound: InboundFetchInput): Promise<Inbound[]> {
        return this.repo.find({where: inbound, relations: ["items", "items.warehouseLocation", 'warehouse']}).catch(error => {
            console.log(error.message);
            throw new Error("Error fetching warehouses")
        })
    }

    private itemArrayToObject<T extends any>(items: {sku: string}[]): {[key: string]: T} {
        let itemsObject: {[key: string]: T} = {}
        items.forEach(item => itemsObject[item.sku] = item as T);
        return itemsObject;
    }

    cloneData<T>(data: T): T {
        return JSON.parse(JSON.stringify(data));
    }
    
}

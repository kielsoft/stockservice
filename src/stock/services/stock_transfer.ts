import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Status, StockTransfer, WarehouseLocationItem } from '../entities';
import { OK, StockTransferGetInput, StockTransferCreateInput, StockTransferReceiveInput, StockTransferCancelInput, StockTransferFetchInput, StockTransferFetchResponseData, StockTransferData } from '../dtos';
import { buildPaginationWithData } from './base';
import { StockTransferError } from '../../errors';
import config from 'src/config';
import { WarehouseService } from './warehouse';
import { WarehouseLocationService } from './warehouse_location';


@Injectable()
export class StockTransferService  {

    constructor(
        @InjectRepository(StockTransfer) private readonly repo: Repository<StockTransfer>,
        @InjectRepository(WarehouseLocationItem) private readonly locationItemrepo: Repository<WarehouseLocationItem>,
        private readonly warehouseService: WarehouseService,
        private readonly warehouseLocationService: WarehouseLocationService,
    ) {}

    async createItems(items: StockTransferCreateInput[]): Promise<StockTransfer[]> {

        const newItems: StockTransfer[] = []

        await Promise.all(items.map(async item => {
            await this.locationItemrepo.findOne({
                sku: item.sku,
                warehouseLocationId: item.fromWarehouseLocationId,
            }).then(async locationItem => {

                if(!locationItem || !locationItem.id){
                    if(config.commom.avoid_no_product_or_qty_error){
                        const i = new WarehouseLocationItem();
                        i.load({
                            warehouseLocationId: item.fromWarehouseLocationId,
                            sku: item.sku, 
                            qty: item.qty,
                            name: `Product-${item.sku}`,
                            description: item.remark || "Create from stock-transfer",
                        });
                        locationItem = await this.locationItemrepo.save(i);
                    } else {
                        throw StockTransferError(`SKU: ${item.sku} not available in WarehouseLocation ID: ${item.fromWarehouseLocationId}`);
                    }
                }
                

                if(locationItem.qty < item.qty) 
                throw StockTransferError(`SKU: ${item.sku} has only ${locationItem.qty} but ${item.qty} request`);

                item.locationItem = locationItem;
                return item;
            })
        }));

        await Promise.all(items.map(async item => {
            item.statusCode = Status.CODE.pending;
            item.remark = item.remark || '';

            await this.repo.findOne({
                sku: item.sku,
                fromWarehouseLocationId: item.fromWarehouseLocationId,
                requestNo: item.requestNo,
                statusCode: item.statusCode
            }).then(async i => {
                if(i && i.id){

                    item.locationItem.qty += i.qty;
                    await item.locationItem.save();

                    i.remark = i.remark || '';
                    i.qty = item.qty;
                    i.transferredById = item.transferredById;
                    (i as any).locationItem = item.locationItem;

                    item = i as any;
                }
            });

            item.remark += String(`${item.remark}\n${(new Date()).toISOString()} => CREATED BY: userId: ${item.transferredById}`).trim();

            await this.repo.save(item).then(async newItem => {
                item.locationItem.qty -= newItem.qty;
                await item.locationItem.save();

                newItems.push(await this.getOne({id: newItem.id}));
            });
        }));

        return newItems;
    }

    async receiveItems(items: StockTransferReceiveInput[]): Promise<StockTransfer[]> {

        const receivedItems: StockTransfer[] = []

        await Promise.all(items.map(async item => {
            const dbItem = await this.repo.findOneOrFail({
                sku: item.sku,
                toWarehouseId: item.receivingWarehouseId,
                requestNo: item.requestNo,
                statusCode: Status.CODE.pending,
            }).then(async i => i)
            .catch(error => {
                if(error.code = 'EntityNotFound') throw StockTransferError(`There is not pending transfer for SKU: ${item.sku} to be received into WarehouseLocation ID: ${item.receivingWarehouseLocationId}`);
                throw error;
            });

            await this.locationItemrepo.findOneOrFail({
                sku: dbItem.sku,
                warehouseLocationId: item.receivingWarehouseLocationId,
            }).then(async locationItem => {
                (dbItem as any).locationItem = locationItem;
            }).catch(async error => {
                if(error.code = 'EntityNotFound'){
                    const i = new WarehouseLocationItem();
                    i.load({
                        warehouseLocationId: item.receivingWarehouseLocationId,
                        sku: dbItem.sku, 
                        qty: 0,
                        name: `Product-${dbItem.sku}`,
                        description: "Create from stock-transfer"
                    });
                    (dbItem as any).locationItem = await this.locationItemrepo.save(i);
                } else {
                    throw error;
                }
            });

            dbItem.receivedById = item.receivedById;
            return dbItem;
        })
        .map(async itemPromise => {
            const item = await itemPromise;
            item.statusCode = Status.CODE.completed;
            item.remark += `\n${(new Date()).toISOString()} => RECEIVED BY: userId: ${item.receivedById}`;

            await item.save().then(async newItem => {
                (item as any).locationItem.qty += newItem.qty;
                await (item as any).locationItem.save();

                receivedItems.push(await this.getOne({id: newItem.id}));
            });
        }));

        return receivedItems;
    }
    
    cancel(item: StockTransferCancelInput): Promise<OK> {
        return this.getOne({id: item.id}).then(stockTransfer => {
            if(stockTransfer.statusCode == Status.CODE.pending){
                stockTransfer.statusCode = Status.CODE.cancelled;
                stockTransfer.remark += `\n${(new Date()).toISOString()} => CANCELLED BY: userId: ${item.userId}`;

                return stockTransfer.save().then(stockTransfer => ({ok: true}))
                .catch(error => ({ok: false}));
            } else {
                throw new Error(`stockTransfer ID: ${stockTransfer.id} with SKU ${stockTransfer.sku} is already ${stockTransfer.statusCode}`);
            }
        })
    }

    getOne(item: StockTransferGetInput): Promise<StockTransfer> {
        return this.repo.findOneOrFail(item, {relations: ["fromWarehouseLocation", "fromWarehouseLocation.warehouse", "toWarehouse"]});
    }
    
    async fetchAll(item: StockTransferFetchInput): Promise<StockTransferFetchResponseData> {
        let pagination = item && item.pagination || {limit: 50, page: 1};
        let skip = (pagination.page > 1)? (pagination.page-1) * pagination.limit : 0;

        if(item && item.pagination) delete item.pagination;
        
        let [data, total] = await this.repo.findAndCount({
            where: item, 
            relations: ["fromWarehouseLocation", "fromWarehouseLocation.warehouse", "toWarehouse"],
            take: pagination.limit,
            skip: skip
        }).catch(error => {
            throw new Error("Error fetching stock transfer records")
        })

        return buildPaginationWithData(data, total, pagination as any);
    }

    async generateRequisitionRequest(data: StockTransferData[]): Promise<StockTransferFetchResponseData> {
        const firstData = data[0];
        if(!firstData?.requestNo) {
            throw StockTransferError('Invalid Transfer Requisition Number');
        }

        const request = []

        for (let index = 0; index < data.length; index++) {
            const i = data[index];
            
            const fromWarehouseLocation = await this.warehouseService.getOne({id: i.fromWarehouseId}).then(w => {
                if(w.name !== i.fromWarehouseName){
                    w.name = i.fromWarehouseName;
                    w.save().catch(e => {});
                }

                if(w.locations && w.locations.length){
                    return w.locations[0];
                }
                
                return this.warehouseLocationService.create({
                    warehouseId: w.id,
                    name: `${w.name} - Main Loc`
                });
            }).catch(error => {
                return this.warehouseService.create({
                    id: i.fromWarehouseId,
                    name: i.fromWarehouseName,
                    address: `Address to ${i.fromWarehouseName}`,
                } as any).then(w => {
                    return w.locations[0];
                });
            });

            const toWarehouse = await this.warehouseService.getOne({id: i.toWarehouseId}).then(async w => {
                if(!w.locations && !w.locations.length){
                    await  this.warehouseLocationService.create({
                        warehouseId: w.id,
                        name: `${w.name} - Main Loc`
                    });
                }

                return w
            }).catch(error => {
                return this.warehouseService.create({
                    id: i.toWarehouseId,
                    name: i.toWarehouseName,
                    address: `Address to ${i.toWarehouseName}`,
                } as any);
            });

            i.fromWarehouseLocationId = fromWarehouseLocation.id;
            (i as any).transferredById = 1;

            request.push(i);
        };

        return this.createItems(request)
        .then(outbound => this.fetchAll({requestNo: firstData.requestNo}));
    }
}

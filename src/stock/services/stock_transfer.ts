import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Status, StockTransfer, WarehouseLocationItem } from '../entities';
import { OK, StockTransferGetInput, StockTransferCreateInput, StockTransferReceiveInput, StockTransferCancelInput, StockTransferFetchInput, StockTransferFetchResponseData } from '../dtos';
import { buildPaginationWithData } from './base';
import { StockTransferError } from '../../errors';


@Injectable()
export class StockTransferService  {

    constructor(
        @InjectRepository(StockTransfer) private readonly repo: Repository<StockTransfer>,
        @InjectRepository(WarehouseLocationItem) private readonly locationItemrepo: Repository<WarehouseLocationItem>,
    ) {}

    async createItems(items: StockTransferCreateInput[]): Promise<StockTransfer[]> {

        const newItems: StockTransfer[] = []

        await Promise.all(items.map(async item => {
            await this.locationItemrepo.findOneOrFail({
                sku: item.sku,
                warehouseLocationId: item.fromWarehouseLocationId,
            }).then(async locationItem => {

                if(locationItem.qty < item.qty) 
                throw StockTransferError(`SKU: ${item.sku} has only ${locationItem.qty} but ${item.qty} request`);

                item.locationItem = locationItem;
                return item;
            }).catch(error => {
                if(error.code = 'EntityNotFound') throw StockTransferError(`SKU: ${item.sku} not available in WarehouseLocation ID: ${item.fromWarehouseLocationId}`);
                throw error;
            });
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
                toWarehouseLocationId: item.receivingWarehouseLocationId,
                requestNo: item.requestNo,
                statusCode: Status.CODE.pending,
            }).then(async i => i)
            .catch(error => {
                if(error.code = 'EntityNotFound') throw StockTransferError(`There is not pending transfer for SKU: ${item.sku} to be received into WarehouseLocation ID: ${item.receivingWarehouseLocationId}`);
                throw error;
            });

            await this.locationItemrepo.findOneOrFail({
                sku: dbItem.sku,
                warehouseLocationId: dbItem.toWarehouseLocationId,
            }).then(async locationItem => {
                (dbItem as any).locationItem = locationItem;
            }).catch(async error => {
                if(error.code = 'EntityNotFound'){
                    const i = new WarehouseLocationItem();
                    i.load({
                        warehouseLocationId: dbItem.toWarehouseLocationId,
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
        return this.repo.findOneOrFail(item, {relations: ["fromWarehouseLocation", "fromWarehouseLocation.warehouse", "toWarehouseLocation", "toWarehouseLocation.warehouse"]});
    }
    
    async fetchAll(item: StockTransferFetchInput): Promise<StockTransferFetchResponseData> {
        let pagination = item && item.pagination || {limit: 50, page: 1};
        let skip = (pagination.page > 1)? (pagination.page-1) * pagination.limit : 0;

        if(item && item.pagination) delete item.pagination;
        
        let [data, total] = await this.repo.findAndCount({
            where: item, 
            relations: ["fromWarehouseLocation", "fromWarehouseLocation.warehouse", "toWarehouseLocation", "toWarehouseLocation.warehouse"],
            take: pagination.limit,
            skip: skip
        }).catch(error => {
            throw new Error("Error fetching stock transfer records")
        })

        return buildPaginationWithData(data, total, pagination as any);
    }
}

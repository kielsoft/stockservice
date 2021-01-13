import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Status, StockCount, WarehouseLocationItem } from '../entities';
import { StockCountCreateInput, StockCountFetchInput, StockCountCancelInput, StockCountApprovalInput, OK, StockCountGetInput, StockCountFetchResponseData } from '../dtos';
import { buildPaginationWithData } from './base';


@Injectable()
export class StockCountService  {

    constructor(
        @InjectRepository(StockCount) private readonly repo: Repository<StockCount>,
        @InjectRepository(WarehouseLocationItem) private readonly locationItemrepo: Repository<WarehouseLocationItem>,
    ) {}

    async create(count: StockCountCreateInput): Promise<StockCount> {
        return this.locationItemrepo.findOne({
            sku: count.sku,
            warehouseLocationId: count.warehouseLocationId,
        })
        .then(async item => {

            if(!item || !item.id){
                item = new WarehouseLocationItem();
                item.load({
                    warehouseLocationId: count.warehouseLocationId,
                    sku: count.sku, 
                    qty: 0,
                    name: `Product-${count.sku}`,
                    description: "Create from stock-count"
                })
                item = await this.locationItemrepo.save(item);
            }

            count.warehouseSkuQty = item.qty;
            count.statusCode = Status.CODE.received;
            count.remark = `${(new Date()).toISOString()} => CREATED BY: userId: ${count.userId}`;

            return this.repo.save(count).then(count => this.getOne({id: count.id}));
        });
    }

    approve(count: StockCountApprovalInput): Promise<StockCount> {
        return this.getOne(count).then(stockCount => {
            if(stockCount.statusCode == Status.CODE.received){
                return this.locationItemrepo.findOne({
                    sku: stockCount.sku,
                    warehouseLocationId: stockCount.warehouseLocationId
                })
                .then(warehouseLocationItem => {
                    return stockCount.save().then(async stockCount => {

                        stockCount.statusCode = Status.CODE.approved;
                        stockCount.approvedQty = count.approvedQty;
                        stockCount.approvedById = count.userId;
                        stockCount.remark += `\n${(new Date()).toISOString()} => APPROVED BY: userId: ${count.userId}, Old Qty: ${warehouseLocationItem.qty}, New Qty: ${count.approvedQty}`;

                        warehouseLocationItem.qty = count.approvedQty;
                        await warehouseLocationItem.save();

                        return stockCount.save().then(stockCount => this.getOne(stockCount));
                    });
                });
            } else {
                throw new Error(`StockCount ID: ${stockCount.id} with SKU ${stockCount.sku} is already ${stockCount.statusCode}`)
            }
        }).catch(error => {
            throw new Error(`Error approving StockCound ID: ${count.id}: ${error.message}`);
        });
    }
    
    cancel(count: StockCountCancelInput): Promise<OK> {
        return this.getOne(count).then(stockCount => {
            if(stockCount.statusCode == Status.CODE.received){
                stockCount.statusCode = Status.CODE.cancelled;
                stockCount.remark += `\n${(new Date()).toISOString()} => CANCELLED BY: userId: ${count.userId}`;

                return stockCount.save().then(stockCount => ({ok: true}))
                .catch(error => ({ok: false}));
            } else {
                throw new Error(`StockCount ID: ${stockCount.id} with SKU ${stockCount.sku} is already ${stockCount.statusCode}`);
            }
        })
    }

    getOne(count: StockCountGetInput): Promise<StockCount> {
        return this.repo.findOneOrFail(count, {relations: ["warehouseLocation", "warehouseLocation.warehouse"]});
    }
    
    async fetchAll(item: StockCountFetchInput): Promise<StockCountFetchResponseData> {
        let pagination = item && item.pagination || {limit: 50, page: 1};
        let skip = (pagination.page > 1)? (pagination.page-1) * pagination.limit : 0;

        if(item && item.pagination) delete item.pagination;
        
        let [data, total] = await this.repo.findAndCount({
            where: item, 
            relations: ["warehouseLocation", "warehouseLocation.warehouse"],
            take: pagination.limit,
            skip: skip
        }).catch(error => {
            throw new Error("Error fetching stock count records")
        })

        return buildPaginationWithData(data, total, pagination as any);
    }
}

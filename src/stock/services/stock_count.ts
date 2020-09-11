import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockCount, WarehouseLocationItem } from '../entities';
import { StockCountCreateInput, StockCountFetchInput, StockCountDeleteInput, OK, StockCountFetchResponseData } from '../dtos';
import { buildPaginationWithData } from './base';


@Injectable()
export class StockCountService  {

    constructor(
        @InjectRepository(StockCount) private readonly repo: Repository<StockCount>,
        @InjectRepository(WarehouseLocationItem) private readonly locationItemrepo: Repository<WarehouseLocationItem>,
    ) {}

    async create(count: StockCountCreateInput): Promise<StockCount> {
        await this.locationItemrepo.findOne({
            sku: count.sku,
            warehouseLocationId: count.warehouseLocationId
        })
        .then(item => count.warehouseSkuQty = item.qty)
        .catch(error => count.warehouseSkuQty = 0)
        return this.repo.save(count).then(count => this.getOne(count));
    }
    
    update(count: StockCountDeleteInput): Promise<OK> {
        return this.repo.delete(count)
        .then(result => ({ok: !!result.affected}))
        .catch(error => ({ok: false}))
    }

    getOne(count: StockCountFetchInput): Promise<StockCount> {
        return this.repo.findOneOrFail(count, {relations: ["warehouseLocation"]});
    }
    
    async fetchAll(item: StockCountFetchInput): Promise<StockCountFetchResponseData> {
        let pagination = item && item.pagination || {limit: 50, page: 1};
        let skip = (pagination.page > 1)? (pagination.page-1) * pagination.limit : 0;
        
        let [data, total] = await this.repo.findAndCount({
            where: item, 
            relations: ["warehouseLocation"],
            take: pagination.limit,
            skip: skip
        }).catch(error => {
            throw new Error("Error fetching stock count records")
        })

        return buildPaginationWithData(data, total, pagination as any);
    }
}

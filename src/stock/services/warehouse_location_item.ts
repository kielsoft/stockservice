import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WarehouseLocationItem } from '../entities';
import { WarehouseLocationItemCreateInput, WarehouseLocationItemUpdateInput, WarehouseLocationItemFetchInput, WarehouseLocationItemFetchResponseData } from '../dtos';
import { buildPaginationWithData } from './base';


@Injectable()
export class WarehouseLocationItemService  {

    constructor(
        @InjectRepository(WarehouseLocationItem) private readonly repo: Repository<WarehouseLocationItem>,
    ) {}

    create(item: WarehouseLocationItemCreateInput): Promise<WarehouseLocationItem> {
        return this.repo.save(item).then(item => this.getOne(item));
    }
    
    update(item: WarehouseLocationItemUpdateInput): Promise<WarehouseLocationItem> {
        return this.repo.save(item).then(item => this.getOne(item))
    }

    getOne(item: WarehouseLocationItemFetchInput): Promise<WarehouseLocationItem> {
        return this.repo.findOneOrFail(item, {relations: ["warehouseLocation", "warehouseLocation.warehouse"]});
    }

    async fetchAll(item: WarehouseLocationItemFetchInput): Promise<WarehouseLocationItemFetchResponseData> {
        let pagination = item && item.pagination || {limit: 50, page: 1};
        let skip = (pagination.page > 1)? (pagination.page-1) * pagination.limit : 0;
        
        if(item) item.pagination = undefined;

        let [data, total] = await this.repo.findAndCount({
            where: item, 
            relations: ["warehouseLocation", "warehouseLocation.warehouse"],
            take: pagination.limit,
            skip: skip
        }).catch(error => {
            throw new Error("Error fetching warehouse location items")
        })

        return buildPaginationWithData(data, total, pagination as any);
    }
}

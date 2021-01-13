import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WarehouseLocation } from '../entities';
import { WarehouseLocationCreateInput, WarehouseLocationUpdateInput, WarehouseLocationFetchInput, WarehouseLocationFetchResponseData } from '../dtos';
import { buildPaginationWithData } from './base';


@Injectable()
export class WarehouseLocationService  {

    constructor(
        @InjectRepository(WarehouseLocation) private readonly locationRepo: Repository<WarehouseLocation>,
    ) {}

    create(location: WarehouseLocationCreateInput): Promise<WarehouseLocation> {
        return this.locationRepo.save(location).then(location => this.getOne(location));
    }
    
    update(location: WarehouseLocationUpdateInput): Promise<WarehouseLocation> {
        return this.locationRepo.save(location).then(location => this.getOne(location))
    }

    getOne(location: WarehouseLocationFetchInput, withItems = true): Promise<WarehouseLocation> {
        const relations = ["warehouse"];
        if(withItems) relations.push("items");

        return this.locationRepo.findOneOrFail(location, {relations});
    }

    async fetchAll(location: WarehouseLocationFetchInput): Promise<WarehouseLocationFetchResponseData> {
        let pagination = location && location.pagination || {limit: 50, page: 1};
        let skip = (pagination.page > 1)? (pagination.page-1) * pagination.limit : 0;
        
        if(location && location.pagination) delete location.pagination;
        
        let [data, total] = await this.locationRepo.findAndCount({
            where: location, 
            relations: ["warehouse", "items"],
            take: pagination.limit,
            skip: skip
        }).catch(error => {
            throw new Error("Error fetching warehouse locations")
        })

        return buildPaginationWithData(data, total, pagination as any);
    }

    
}

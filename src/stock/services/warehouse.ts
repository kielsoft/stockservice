import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from '../entities';
import { WarehouseCreateInput, WarehouseUpdateInput, WarehouseFetchInput, WarehouseFetchResponseData } from '../dtos';
import { buildPaginationWithData } from './base';
import { WarehouseLocationService } from './warehouse_location';


@Injectable()
export class WarehouseService  {

    constructor(
        @InjectRepository(Warehouse) private readonly warehouseRepo: Repository<Warehouse>,
        private readonly warehouseLocationService: WarehouseLocationService,
    ) {}

    create(warehouse: WarehouseCreateInput): Promise<Warehouse> {
        return this.warehouseRepo.save(warehouse).then(warehouse => {
            return this.warehouseLocationService.create({
                warehouseId: warehouse.id,
                name: `${warehouse.name} - Main Loc`,
            }).then(wl => this.getOne({id: wl.warehouseId}));
        })
    }
    
    update(warehouse: WarehouseUpdateInput): Promise<Warehouse> {
        return this.warehouseRepo.save(warehouse).then(warehouse => this.getOne(warehouse))
    }

    getOne(warehouse: WarehouseFetchInput): Promise<Warehouse> {
        return this.warehouseRepo.findOneOrFail(warehouse, {relations: ["locations"]});
    }

    async fetchAll(warehouse: WarehouseFetchInput): Promise<WarehouseFetchResponseData> {
        let pagination = warehouse && warehouse.pagination || {limit: 50, page: 1};
        let skip = (pagination.page > 1)? (pagination.page-1) * pagination.limit : 0;
        
        if(warehouse && warehouse.pagination) delete warehouse.pagination;
        

        let [data, total] = await this.warehouseRepo.findAndCount({
            where: warehouse, 
            relations: ["locations"],
            take: pagination.limit,
            skip: skip,
        }).catch(error => {
            console.log(error.message);
            throw new Error("Error fetching warehouses")
        })

        return buildPaginationWithData(data, total, pagination as any);
    }

    
}

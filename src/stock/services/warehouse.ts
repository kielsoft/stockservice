import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from '../entities';
import { WarehouseCreateInput, WarehouseUpdateInput, WarehouseFetchInput } from '../dtos';


@Injectable()
export class WarehouseService  {

    constructor(
        @InjectRepository(Warehouse) private readonly warehouseRepo: Repository<Warehouse>,
    ) {}

    create(warehouse: WarehouseCreateInput): Promise<Warehouse> {
        return this.warehouseRepo.save(warehouse);
    }
    
    update(warehouse: WarehouseUpdateInput): Promise<Warehouse> {
        return this.warehouseRepo.save(warehouse).then(warehouse => {
            return this.warehouseRepo.findOneOrFail({id: warehouse.id});
        })
    }

    getOne(warehouse: WarehouseFetchInput): Promise<Warehouse> {
        return this.warehouseRepo.findOneOrFail(warehouse);
    }

    fetchAll(warehouse: WarehouseFetchInput): Promise<Warehouse[]> {
        return this.warehouseRepo.find(warehouse).catch(error => {
            console.log(error.message);
            throw new Error("Error fetching warehouses")
        })
    }

    
}

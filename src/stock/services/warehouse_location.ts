import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WarehouseLocation } from '../entities';
import { WarehouseLocationCreateInput, WarehouseLocationUpdateInput, WarehouseLocationFetchInput } from '../dtos';


@Injectable()
export class WarehouseLocationService  {

    constructor(
        @InjectRepository(WarehouseLocation) private readonly locationRepo: Repository<WarehouseLocation>,
    ) {}

    create(location: WarehouseLocationCreateInput): Promise<WarehouseLocation> {
        console.log(location);
        return this.locationRepo.save(location);
    }
    
    update(location: WarehouseLocationUpdateInput): Promise<WarehouseLocation> {
        return this.locationRepo.save(location).then(location => {
            return this.locationRepo.findOneOrFail({id: location.id});
        })
    }

    getOne(location: WarehouseLocationFetchInput): Promise<WarehouseLocation> {
        return this.locationRepo.findOneOrFail(location);
    }

    fetchAll(location: WarehouseLocationFetchInput): Promise<WarehouseLocation[]> {
        return this.locationRepo.find(location).catch(error => {
            console.log(error.message);
            throw new Error("Error fetching warehouses")
        })
    }

    
}

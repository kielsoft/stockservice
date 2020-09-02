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
        return this.locationRepo.save(location).then(location => this.getOne(location));
    }
    
    update(location: WarehouseLocationUpdateInput): Promise<WarehouseLocation> {
        return this.locationRepo.save(location).then(location => this.getOne(location))
    }

    getOne(location: WarehouseLocationFetchInput): Promise<WarehouseLocation> {
        return this.locationRepo.findOneOrFail(location, {relations: ["warehouse", "items"]});
    }

    fetchAll(location: WarehouseLocationFetchInput): Promise<WarehouseLocation[]> {
        return this.locationRepo.find({where: location, relations: ["warehouse", "items"]}).catch(error => {
            console.log(error.message);
            throw new Error("Error fetching warehouse locations")
        })
    }

    
}

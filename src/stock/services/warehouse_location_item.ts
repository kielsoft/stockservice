import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WarehouseLocationItem } from '../entities';
import { WarehouseLocationItemCreateInput, WarehouseLocationItemUpdateInput, WarehouseLocationItemFetchInput } from '../dtos';


@Injectable()
export class WarehouseLocationItemService  {

    constructor(
        @InjectRepository(WarehouseLocationItem) private readonly repo: Repository<WarehouseLocationItem>,
    ) {}

    create(location: WarehouseLocationItemCreateInput): Promise<WarehouseLocationItem> {
        console.log(location);
        return this.repo.save(location);
    }
    
    update(location: WarehouseLocationItemUpdateInput): Promise<WarehouseLocationItem> {
        return this.repo.save(location).then(location => {
            return this.repo.findOneOrFail({id: location.id});
        })
    }

    getOne(location: WarehouseLocationItemFetchInput): Promise<WarehouseLocationItem> {
        return this.repo.findOneOrFail(location);
    }

    fetchAll(location: WarehouseLocationItemFetchInput): Promise<WarehouseLocationItem[]> {
        return this.repo.find(location).catch(error => {
            console.log(error.message);
            throw new Error("Error fetching warehouses")
        })
    }
}

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

    create(item: WarehouseLocationItemCreateInput): Promise<WarehouseLocationItem> {
        return this.repo.save(item).then(item => this.getOne(item));
    }
    
    update(item: WarehouseLocationItemUpdateInput): Promise<WarehouseLocationItem> {
        return this.repo.save(item).then(item => this.getOne(item))
    }

    getOne(item: WarehouseLocationItemFetchInput): Promise<WarehouseLocationItem> {
        return this.repo.findOneOrFail(item, {relations: ["warehouseLocation", "warehouseLocation.warehouse"]});
    }

    fetchAll(item: WarehouseLocationItemFetchInput): Promise<WarehouseLocationItem[]> {
        return this.repo.find({where: item, relations: ["warehouseLocation", "warehouseLocation.warehouse"]}).catch(error => {
            console.log(error.message);
            throw new Error("Error fetching warehouse location items")
        })
    }
}

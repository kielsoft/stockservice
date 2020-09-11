import { Field, Int, ObjectType, InputType } from '@nestjs/graphql';
import { PaginationInputData, PaginationResponseData } from './base';
import { type } from 'os';
import { Warehouse, WarehouseLocation, WarehouseLocationItem } from '../entities';

@InputType()
export class WarehouseCreateInput {
    @Field()
    name: string;

    @Field()
    address: string;

    @Field({ nullable: true })
    isActive?: boolean;
}

@InputType()
export class WarehouseUpdateInput {
    @Field(type => Int)
    id: number;

    @Field({nullable: true})
    name?: string;

    @Field({nullable: true})
    address?: string;

    @Field({ nullable: true })
    isActive?: boolean;
}

@InputType()
export class WarehouseFetchInput {
    @Field({nullable: true})
    id?: number;

    @Field({nullable: true})
    isActive?: boolean;
    
    @Field(type => PaginationInputData, {nullable: true, defaultValue: {limit: 50, page: 1}})
    pagination?: PaginationInputData;
}

// Warehouse Location
@InputType()
export class WarehouseLocationCreateInput {
    @Field()
    warehouseId: number;

    @Field()
    name: string;

    @Field({defaultValue: true})
    availableToSell?: boolean;
}

@InputType()
export class WarehouseLocationUpdateInput {
    @Field(type => Int)
    id: number;

    @Field({nullable: true})
    warehouseId?: number;

    @Field({nullable: true})
    name?: string;

    @Field({ nullable: true })
    availableToSell?: boolean;
}

@InputType()
export class WarehouseLocationFetchInput {
    @Field({nullable: true})
    id?: number;

    @Field({nullable: true})
    warehouseId?: number;

    @Field({nullable: true})
    availableToSell?: boolean;

    @Field(type => PaginationInputData, {nullable: true, defaultValue: {limit: 50, page: 1}})
    pagination?: PaginationInputData;
}


// Warehouse Location Item
@InputType()
export class WarehouseLocationItemCreateInput {
    @Field()
    warehouseLocationId: number;

    @Field()
    sku: string;
    
    @Field({defaultValue: 0})
    qty: number;
}

@InputType()
export class WarehouseLocationItemUpdateInput {
    @Field(type => Int)
    id: number;

    @Field({nullable: true})
    warehouseId?: number;

    @Field({nullable: true})
    sku?: string;

    @Field({ nullable: true })
    qty?: number;
}

@InputType()
export class WarehouseLocationItemFetchInput {
    @Field({nullable: true})
    id?: number;

    @Field({nullable: true})
    warehouseId?: number;

    @Field({nullable: true})
    sku?: string;

    @Field(type => PaginationInputData, {nullable: true, defaultValue: {limit: 50, page: 1}})
    pagination?: PaginationInputData;
}

// Response Objects

@ObjectType()
export class WarehouseFetchResponseData extends PaginationResponseData {
    @Field(type => [Warehouse], {nullable: true})
    data: Warehouse[];
}

@ObjectType()
export class WarehouseLocationFetchResponseData  extends PaginationResponseData {
    @Field(type => [WarehouseLocation], {nullable: true})
    data: WarehouseLocation[];
}

@ObjectType()
export class WarehouseLocationItemFetchResponseData extends PaginationResponseData {
    @Field(type => [WarehouseLocationItem], {nullable: true})
    data: WarehouseLocationItem[];
}
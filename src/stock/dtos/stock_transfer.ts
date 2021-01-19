import { Field, Int, InputType, ObjectType } from '@nestjs/graphql';
import { PaginationResponseData, PaginationInputData } from './base';
import { StockTransfer, WarehouseLocation, WarehouseLocationItem } from '../entities';

@InputType()
export class StockTransferCreateInput {
    @Field()
    requestNo: string;

    @Field({nullable: true})
    fromWarehouseLocationId: number

    @Field({nullable: true})
    toWarehouseLocationId: number

    @Field({nullable: true})
    remark?: string;

    @Field()
    sku: string;

    @Field()
    qty: number;

    transferredById: number;

    statusCode: string;
    
    locationItem: WarehouseLocationItem;
}

@InputType()
export class StockTransferGetInput {
    @Field(type => Int)
    id: number;
}

@InputType()
export class StockTransferCancelInput {
    @Field(type => Int)
    id: number;

    statusCode: string;

    userId: number
}

@InputType()
export class StockTransferReceiveInput {
    @Field()
    receivingWarehouseLocationId: number;

    @Field()
    requestNo: string;
   
    @Field()
    sku: string;

    @Field()
    qty: number;

    remark: string;

    statusCode: string;

    receivedById: number;

    locationItem: WarehouseLocationItem;
}

@InputType()
export class StockTransferFetchInput {
    @Field({nullable: true})
    id?: number;
    
    @Field({nullable: true})
    requestNo?: string;

    @Field({nullable: true})
    fromWarehouseLocationId?: number;
    
    @Field({nullable: true})
    toWarehouseLocationId?: number;

    @Field({nullable: true})
    sku?: string;

    @Field({nullable: true})
    transferredById?: number;
    
    @Field({nullable: true})
    receivedById?: number;
    
    @Field({nullable: true})
    statusCode?: string;

    @Field(type => PaginationInputData, {nullable: true, defaultValue: {limit: 50, page: 1}})
    pagination?: PaginationInputData;
}

// Response Objects

@ObjectType()
export class StockTransferFetchResponseData extends PaginationResponseData {

    @Field({nullable: true})
    warehouseLocation?: WarehouseLocation;
    
    @Field(type => [StockTransfer], {nullable: true})
    data: StockTransfer[];
}

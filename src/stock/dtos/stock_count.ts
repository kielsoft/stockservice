import { Field, Int, InputType, ObjectType } from '@nestjs/graphql';
import { PaginationResponseData, PaginationInputData } from './base';
import { StockCount, WarehouseLocation } from '../entities';

@InputType()
export class StockCountCreateInput {
    @Field()
    referenceId: string
    
    @Field()
    warehouseLocationId: number

    @Field()
    sku: string;

    @Field()
    qty: number;

    remark: string;

    warehouseSkuQty: number;

    statusCode: string;

    userId: number;
}

@InputType()
export class StockCountGetInput {
    @Field(type => Int)
    id: number;

    userId?: number;
}

@InputType()
export class StockCountCancelInput extends StockCountGetInput { }

@InputType()
export class StockCountApprovalInput {
    @Field(type => Int)
    id: number;

    @Field()
    approvedQty: number;

    userId: number;
}

@InputType()
export class StockCountFetchInput {
    @Field({nullable: true})
    id?: number;

    @Field({nullable: true})
    referenceId?: string;

    @Field({nullable: true})
    warehouseLocationId?: number;

    @Field({nullable: true})
    sku?: string;

    @Field({nullable: true})
    userId?: number;
    
    @Field({nullable: true})
    statusCode?: string;

    @Field(type => PaginationInputData, {nullable: true, defaultValue: {limit: 100, page: 1}})
    pagination?: PaginationInputData;
}

// Response Objects

@ObjectType()
export class StockCountFetchResponseData extends PaginationResponseData {

    @Field({nullable: true})
    warehouseLocation?: WarehouseLocation;

    @Field(type => [StockCount], {nullable: true})
    data: StockCount[];
}

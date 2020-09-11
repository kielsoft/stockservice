import { Field, Int, InputType, ObjectType } from '@nestjs/graphql';
import { PaginationResponseData, PaginationInputData } from './base';
import { StockCount } from '../entities';

@InputType()
export class StockCountCreateInput {
    @Field()
    warehouseLocationId: number

    @Field()
    sku: string;

    @Field()
    qty: number;

    @Field({nullable: true})
    remark: string;

    warehouseSkuQty: number;
    userId: number;
}

@InputType()
export class StockCountDeleteInput {
    @Field(type => Int)
    id: number;
}

@InputType()
export class StockCountFetchInput {
    @Field({nullable: true})
    id?: number;

    @Field({nullable: true})
    warehouseId?: number;

    @Field({nullable: true})
    sku?: string;

    @Field({nullable: true})
    userId?: number;

    @Field(type => PaginationInputData, {nullable: true, defaultValue: {limit: 50, page: 1}})
    pagination?: PaginationInputData;
}

// Response Objects

@ObjectType()
export class StockCountFetchResponseData extends PaginationResponseData {
    @Field(type => [StockCount], {nullable: true})
    data: StockCount[];
}

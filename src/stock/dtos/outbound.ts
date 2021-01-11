import { Field, Int, InputType, ObjectType } from '@nestjs/graphql';
import { PaginationResponseData, PaginationInputData } from './base';
import { Outbound, OutboundItem } from '../entities';

@InputType()
export class OutboundCreateInput {
    @Field()
    warehouseId: number

    @Field()
    requestNo: string;

    @Field({nullable: true})
    remark: string;

    @Field(type => [OutboundItemCreateInput])
    items: OutboundItemCreateInput[];

    userId: number;
    statusCode: string;
}

@InputType()
export class OutboundPickInput {
    @Field(type => Int)
    id: number;

    @Field({nullable: true})
    remark?: string;

    pickerId: number;

    @Field(type => [OutboundItemPickInput])
    items: OutboundItemPickInput[];
}

@InputType()
export class OutboundFetchInput {
    @Field({nullable: true})
    id?: number;

    @Field({nullable: true})
    warehouseId?: number;

    @Field({nullable: true})
    requestNo?: string;

    @Field(type => PaginationInputData, {nullable: true, defaultValue: {limit: 50, page: 1}})
    pagination?: PaginationInputData;
}

@InputType()
export class OutboundItemFetchInput {
    @Field({nullable: true})
    id?: number;

    @Field({nullable: true})
    warehouseLocationId?: number;

    @Field({nullable: true})
    outboundId?: number;
    
    @Field({nullable: true})
    sku?: string;

    @Field(type => PaginationInputData, {nullable: true, defaultValue: {limit: 50, page: 1}})
    pagination?: PaginationInputData;
}

// Outbound Item
@InputType()
export class OutboundItemCreateInput {

    @Field()
    sku: string;

    @Field()
    qty: number;
    
}

@InputType()
export class OutboundItemPickInput {

    @Field()
    warehouseLocationId: number;

    @Field()
    sku: string;

    @Field()
    qty: number;
    
}


// Response Objects

@ObjectType()
export class OutboundFetchResponseData extends PaginationResponseData {
    @Field(type => [Outbound], {nullable: true})
    data: Outbound[];
}

@ObjectType()
export class OutboundItemFetchResponseData extends PaginationResponseData {
    @Field(type => [OutboundItem], {nullable: true})
    data: OutboundItem[];
}
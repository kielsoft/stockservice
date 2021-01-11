import { Field, Int, InputType, ObjectType } from '@nestjs/graphql';
import { PaginationResponseData, PaginationInputData } from './base';
import { Inbound, InboundItem } from '../entities';

@InputType()
export class InboundCreateInput {
    @Field()
    warehouseId: number

    @Field()
    receiptNo: string;

    @Field()
    poNo: string;

    @Field({nullable: true})
    remark: string;

    @Field(type => [InboundItemCreateInput])
    items: InboundItemCreateInput[];

    userId: number;
    statusCode: string;
}

@InputType()
export class InboundUpdateInput {
    @Field(type => Int)
    id: number;

    @Field({nullable: true})
    remark?: string;

    @Field({nullable: true})
    statusCode?: string;
}

@InputType()
export class InboundPutAwayInput {
    @Field(type => Int)
    id: number;

    @Field({nullable: true})
    remark?: string;

    putawayBy: number;

    @Field(type => [InboundItemPutAwayInput])
    items: InboundItemPutAwayInput[];
}

@InputType()
export class InboundFetchInput {
    @Field({nullable: true})
    id?: number;

    @Field({nullable: true})
    warehouseId?: number;

    @Field({nullable: true})
    receiptNo?: string;

    @Field({nullable: true})
    poNo?: string;

    @Field(type => PaginationInputData, {nullable: true, defaultValue: {limit: 50, page: 1}})
    pagination?: PaginationInputData;
}

@InputType()
export class InboundItemFetchInput {
    @Field({nullable: true})
    id?: number;

    @Field({nullable: true})
    warehouseLocationId?: number;

    @Field({nullable: true})
    inboundId?: number;

    @Field({nullable: true})
    putawayBy?: number;
    
    @Field({nullable: true})
    sku?: string;

    @Field(type => PaginationInputData, {nullable: true, defaultValue: {limit: 50, page: 1}})
    pagination?: PaginationInputData;
}

// Inbound Item
@InputType()
export class InboundItemCreateInput {
    @Field()
    sku: string;
    
    @Field({nullable: true})
    name?: string;
    
    @Field({nullable: true})
    description?: string;

    @Field()
    qty: number;
    
    @Field()
    price: number;
    
    @Field()
    total: number;
}

@InputType()
export class InboundItemPutAwayInput {
    @Field()
    sku: string;

    @Field()
    qty: number;

    @Field()
    warehouseLocationId: number;

    putawayBy?: number;

}


// Response Objects

@ObjectType()
export class InboundFetchResponseData extends PaginationResponseData {
    @Field(type => [Inbound], {nullable: true})
    data: Inbound[];
}

@ObjectType()
export class InboundItemFetchResponseData extends PaginationResponseData {
    @Field(type => [InboundItem], {nullable: true})
    data: InboundItem[];
}
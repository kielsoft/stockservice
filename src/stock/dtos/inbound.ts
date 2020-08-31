import { Field, Int, InputType } from '@nestjs/graphql';

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

    @Field({nullable: true, defaultValue: "received"})
    statusCode?: string;
}

@InputType()
export class InboundUpdateInput {
    @Field(type => Int)
    id: number;

    @Field({nullable: true})
    remark?: string;

    @Field({nullable: true})
    putawayBy?: number;

    @Field({nullable: true})
    statusCode?: string;
}

@InputType()
export class InboundPutAwayInput {
    @Field(type => Int)
    id: number;

    @Field({nullable: true})
    remark?: string;

    @Field()
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
}

// Inbound Item
@InputType()
export class InboundItemCreateInput {
    @Field()
    sku: string;

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

}

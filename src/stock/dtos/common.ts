import { Field, InputType, ObjectType } from '@nestjs/graphql';

@InputType()
export class LoginInput {
    @Field()
    email: string

    @Field()
    password: string;
}

@InputType()
export class PoItemsFetchInput {
    @Field()
    poNo: string;
}

// Response Objects

@ObjectType()
export class AuthenticationData {
    @Field()
    message: string;

    @Field({nullable: true})
    jwt?: string;

    @Field({nullable: true})
    userId?: number;

    @Field({nullable: true})
    contactName?: string;

    @Field({nullable: true})
    branchId?: number;
    
    @Field({nullable: true})
    email?: string;

    @Field({nullable: true})
    expireAt?: number;
}

@ObjectType()
export class PoItemData {

    @Field()
    poNo: string;

    @Field()
    sku: string;

    @Field()
    qty: number;

    @Field()
    price: number;

    @Field()
    total: number;

    @Field({nullable: true})
    name: string;

    @Field({nullable: true})
    description: string;

    @Field()
    statusCode: string;
}

@ObjectType()
export class RequisitionData {

    @Field()
    requestNo: string;

    @Field()
    createdAt: Date;

    @Field()
    sku: string;

    @Field()
    qty: number;

    @Field()
    reason: string;

    @Field({nullable: true})
    detail?: string;

    @Field()
    statusCode: string;

    @Field()
    type: string;
}

@ObjectType()
export class StockTransferData {

    @Field()
    requestNo: string;

    @Field()
    createdAt: Date;

    @Field()
    sku: string;

    @Field()
    qty: number;
    
    @Field()
    fromWarehouseId: number;
    
    @Field()
    fromWarehouseLocationId: number;
    
    @Field()
    fromWarehouseName: string;

    @Field()
    toWarehouseId: number;
    
    @Field()
    toWarehouseName: string;

    @Field()
    reason: string;

}
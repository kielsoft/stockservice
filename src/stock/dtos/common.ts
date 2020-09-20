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
    branchId?: 4;
    
    @Field({nullable: true})
    email?: string;

    @Field({nullable: true})
    password?: string;

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


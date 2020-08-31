import { Field, Int, ObjectType, InputType } from '@nestjs/graphql';

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
}
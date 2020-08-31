import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, Index, } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Warehouse, WarehouseLocationItem, InboundItem, StockCount } from './';
import { Field, ObjectType } from '@nestjs/graphql';

@Entity()
@ObjectType()
@Index('UNIQ_warehouse_loc_name_in_warehouse', ["warehouse", 'name'], { unique: true})
export class WarehouseLocation extends BaseEntity {
    @PrimaryGeneratedColumn()
    @Field()
    id: number;

    @ManyToOne(type => Warehouse, warehouse => warehouse.locations)
    @Field(type => Warehouse)
    warehouse: Warehouse;

    @Column()
    warehouseId: number

    @OneToMany(type => WarehouseLocationItem, warehouseLocationItem => warehouseLocationItem.warehouseLocation, {nullable: false})
    @Field(type => [WarehouseLocationItem], {nullable: true})
    items: WarehouseLocationItem[]; 

    @OneToMany(type => StockCount, cc => cc.warehouseLocation)
    @Field(type => [StockCount], {nullable: true})
    stockCounts: StockCount[]; 

    @OneToMany(type => InboundItem, items => items.inbound)
    @Field(type => [InboundItem], {nullable: true})
    inboundItems: InboundItem[];

    @Column({length: 100, nullable: false})
    @Field()
    name: string;

    @Column({nullable: false, default: true})
    @Field()
    availableToSell: boolean;
}

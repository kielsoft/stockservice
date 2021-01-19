import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, Index, } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Warehouse, WarehouseLocationItem, InboundItem, StockCount } from './';
import { Field, ObjectType } from '@nestjs/graphql';
import { OutboundItem } from './outbound_item.entity';
import { StockTransfer } from './stock_transfer.entity';

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
    @Field()
    warehouseId: number

    @OneToMany(type => WarehouseLocationItem, warehouseLocationItem => warehouseLocationItem.warehouseLocation, {nullable: false})
    @Field(type => [WarehouseLocationItem], {nullable: true})
    items: WarehouseLocationItem[]; 

    @OneToMany(type => InboundItem, inboundItem => inboundItem.warehouseLocation, {nullable: false})
    @Field(type => [InboundItem], {nullable: true})
    inboundItems: InboundItem[];
    
    @OneToMany(type => OutboundItem, outboundItem => outboundItem.warehouseLocation, {nullable: false})
    @Field(type => [OutboundItem], {nullable: true})
    outbountItems: OutboundItem[];

    @OneToMany(type => StockTransfer, st => st.fromWarehouseLocation, {nullable: true})
    @Field(type => [StockTransfer], {nullable: true})
    transferredOutItems?: StockTransfer[];

    @OneToMany(type => StockCount, cc => cc.warehouseLocation)
    @Field(type => [StockCount], {nullable: true})
    stockCounts: StockCount[]; 

    @Column({length: 100, nullable: false})
    @Field()
    name: string;

    @Column({nullable: false, default: true})
    @Field()
    availableToSell: boolean;
}

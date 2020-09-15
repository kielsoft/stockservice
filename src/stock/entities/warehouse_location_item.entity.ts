import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, Index, } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { WarehouseLocation } from './';
import { ObjectType, Field } from '@nestjs/graphql';


@Entity()
@ObjectType()
@Index('UNIQ_warehouse_loc_sku', ["warehouseLocationId", 'sku'], { unique: true})
export class WarehouseLocationItem extends BaseEntity {
    @PrimaryGeneratedColumn()
    @Field()
    id: number;
    
    @ManyToOne(type => WarehouseLocation, locations => locations.items)
    @Field(type => WarehouseLocation)
    warehouseLocation: WarehouseLocation;

    @Column()
    @Field()
    warehouseLocationId: number

    @Column({length: 100, nullable: false})
    @Field()
    sku: string;

    @Column({nullable: false})
    @Field()
    qty: number;
}

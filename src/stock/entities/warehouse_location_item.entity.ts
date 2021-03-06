import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, Index, JoinColumn, } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { WarehouseLocation } from '.';
import { ObjectType, Field } from '@nestjs/graphql';
import { Item } from './item.entity';


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

    @Column({length: 255, nullable: true})
    @Field({nullable: true})
    name: string;

    @Column({type: 'text', nullable: true})
    @Field({nullable: true})
    description: string;

    @Column({nullable: false})
    @Field()
    qty: number;

    // @ManyToOne(type => Item, i => i.warehouseLocationItems, {nullable: true})
    // @Field(type => Item, {nullable: true})
    // @JoinColumn({ name: "sku", referencedColumnName: "sku" })
    // item?: Item;

}

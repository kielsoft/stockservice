import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, Index, } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { ObjectType, Field } from '@nestjs/graphql';
import { WarehouseLocationItem } from './warehouse_location_item.entity';


@Entity()
@ObjectType()
@Index('UNIQ_item_sku', ['sku'], { unique: true})
export class Item extends BaseEntity {
    @PrimaryGeneratedColumn()
    @Field()
    id: number;

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
    intialPrice: number;

    // @ManyToOne(type => WarehouseLocationItem, i => i.item, {nullable: true})
    // @Field(type => WarehouseLocationItem, {nullable: true})
    // warehouseLocationItems?: WarehouseLocationItem[]
}

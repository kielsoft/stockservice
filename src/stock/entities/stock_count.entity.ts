import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { WarehouseLocation } from './';
import { ObjectType, Field } from '@nestjs/graphql';

@Entity()
@ObjectType()
export class StockCount extends BaseEntity {
    @PrimaryGeneratedColumn()
    @Field()
    id: number;
    
    @ManyToOne(type => WarehouseLocation, locations => locations.stockCounts)
    @Field(type => WarehouseLocation)
    warehouseLocation: WarehouseLocation;

    @Column()
    warehouseLocationId: number

    @Column({length: 100, nullable: false})
    @Field()
    sku: string;

    @Column({nullable: false})
    @Field()
    qty: number;

    @Column({nullable: false, default: 0})
    @Field()
    warehouseSkuQty: number;
    
    @Column({nullable: false})
    @Field()
    userId: number;
    
    @Column({type: 'text', nullable: true})
    @Field({nullable: true})
    remark: string;
}

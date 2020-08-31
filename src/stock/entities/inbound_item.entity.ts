import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Status, Inbound, WarehouseLocation } from './';
import { ObjectType, Field } from '@nestjs/graphql';

@Entity()
@ObjectType()
export class InboundItem extends BaseEntity {
    @PrimaryGeneratedColumn()
    @Field()
    id: number;

    @ManyToOne(type => Inbound, inbound => inbound.items)
    @Field(type => Inbound)
    inbound: Inbound;

    @Column()
    inboundId: number

    @ManyToOne(type => WarehouseLocation, locations => locations.items, {nullable: true})
    @Field(type => WarehouseLocation, {nullable: true})
    warehouseLocation: WarehouseLocation;

    @Column({nullable: true})
    warehouseLocationId: number

    @Column({length: 100})
    @Field()
    sku: string;

    @Column()
    @Field()
    qty: number;
    
    @Column()
    @Field()
    price: number;
    
    @Column()
    @Field()
    total: number;
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Inbound, WarehouseLocation } from './';
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

    @ManyToOne(type => WarehouseLocation, locations => locations.inboundItems, {nullable: true})
    @Field(type => WarehouseLocation, {nullable: true})
    warehouseLocation: WarehouseLocation;

    @Column({nullable: true})
    @Field({nullable: true})
    warehouseLocationId: number

    @Column({length: 100})
    @Field()
    sku: string;

    @Column({length: 255, nullable: true})
    @Field({nullable: true})
    name: string;

    @Column({type: 'text', nullable: true})
    @Field({nullable: true})
    description: string;

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

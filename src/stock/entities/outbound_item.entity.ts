import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Outbound, WarehouseLocation } from './';
import { ObjectType, Field } from '@nestjs/graphql';

@Entity()
@ObjectType()
export class OutboundItem extends BaseEntity {
    @PrimaryGeneratedColumn()
    @Field()
    id: number;

    @ManyToOne(type => Outbound, outbound => outbound.items)
    @Field(type => Outbound)
    outbound: Outbound;

    @Column()
    @Field()
    outboundId: number

    @ManyToOne(type => WarehouseLocation, locations => locations.outbountItems, {nullable: true})
    @Field(type => WarehouseLocation, {nullable: true})
    warehouseLocation: WarehouseLocation;

    @Column({nullable: true})
    @Field({nullable: true})
    warehouseLocationId: number

    @Column({nullable: true})
    @Field({nullable: true})
    pickerId: number;

    @Column({length: 100})
    @Field()
    sku: string;

    @Column()
    @Field()
    qty: number;
    
}

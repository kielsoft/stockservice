import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index, } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { WarehouseLocation, Inbound } from './';
import { ObjectType, Field, Int } from '@nestjs/graphql';

@Entity()
@Index('UNIQ_warehouse_name_address', ["name", 'address'], { unique: true})
@ObjectType()
export class Warehouse extends BaseEntity {
    @PrimaryGeneratedColumn()
    @Field(type => Int)
    id: number;

    @Column({length: 100, nullable: false})
    @Field()
    name: string;

    @Column({length: 255, nullable: true})
    @Field()
    address: string;

    @Column({nullable: false, default: true})
    @Field()
    isActive: boolean;

    @OneToMany(type => WarehouseLocation, location => location.warehouse, {nullable: true})
    @Field(type => [WarehouseLocation], {nullable: true})
    locations?: WarehouseLocation[];
    
    @OneToMany(type => Inbound, inbound => inbound.warehouse, {nullable: true})
    @Field(type => [Inbound], {nullable: true})
    inboundItems?: Inbound[];
}

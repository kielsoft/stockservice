import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, Index, } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Warehouse, Status, OutboundItem } from '.';
import { ObjectType, Field } from '@nestjs/graphql';
import { WarehouseLocation } from './warehouse_location.entity';

@Entity()
@ObjectType()
// @Index('UNIQ_transfer_requestNo', ['requestNo'], { unique: true})
export class StockTransfer extends BaseEntity {
    @PrimaryGeneratedColumn()
    @Field()
    id: number;

    @Column({length: 100})
    @Field()
    requestNo: string;

    @ManyToOne(type => WarehouseLocation, locations => locations.transferredOutItems, {nullable: true})
    @Field(type => WarehouseLocation, {nullable: true})
    fromWarehouseLocation: WarehouseLocation;

    @Column({nullable: true})
    @Field({nullable: true})
    fromWarehouseLocationId: number


    @ManyToOne(type => Warehouse, w => w.transferredInItems, {nullable: true})
    @Field(type => Warehouse, {nullable: true})
    toWarehouse: Warehouse;

    @Column({nullable: true})
    @Field({nullable: true})
    toWarehouseId: number

    @Column()
    @Field()
    transferredById: number;
    
    @Column({nullable: true})
    @Field({nullable: true})
    receivedById?: number;

    @Column({type: "text", nullable: true})
    @Field({nullable: true})
    remark?: string;

    @ManyToOne(type => Status, status => status.transferredItems)
    @Field(type => Status)
    @JoinColumn({ name: "status_code", referencedColumnName: "code" })
    status: Status;

    @Column({length: 100})
    @Field()
    statusCode: string;

    @Column({length: 100})
    @Field()
    sku: string;

    @Column()
    @Field()
    qty: number;
}

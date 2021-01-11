import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, Index, } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Warehouse, Status, OutboundItem } from './';
import { ObjectType, Field } from '@nestjs/graphql';

@Entity()
@ObjectType()
@Index('UNIQ_outbound_grn', ['requestNo'], { unique: true})
export class Outbound extends BaseEntity {
    @PrimaryGeneratedColumn()
    @Field()
    id: number;

    @ManyToOne(type => Warehouse, warehouse => warehouse.outboundItems)
    @Field(type => Warehouse)
    warehouse: Warehouse;

    @Column()
    @Field()
    warehouseId: number

    @Column({length: 100})
    @Field()
    requestNo: string;

    @Column()
    @Field()
    userId: number;

    @Column({type: "text", nullable: true})
    @Field({nullable: true})
    remark: string;

    @ManyToOne(type => Status, status => status.outboundItems)
    @Field(type => Status)
    @JoinColumn({ name: "status_code", referencedColumnName: "code" })
    status: Status;

    @Column({length: 100, nullable: false})
    @Field()
    statusCode: string;

    @OneToMany(type => OutboundItem, items => items.outbound)
    @Field(type => [OutboundItem], {nullable: true})
    items: OutboundItem[];
}

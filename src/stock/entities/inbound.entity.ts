import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, Index, } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Warehouse, Status, InboundItem } from './';
import { ObjectType, Field } from '@nestjs/graphql';

@Entity()
@ObjectType()
@Index('UNIQ_inbound_grn', ["receiptNo", 'poNo'], { unique: true})
export class Inbound extends BaseEntity {
    @PrimaryGeneratedColumn()
    @Field()
    id: number;

    @ManyToOne(type => Warehouse, warehouse => warehouse.inboundItems)
    @Field(type => Warehouse)
    warehouse: Warehouse;

    @Column()
    @Field()
    warehouseId: number

    @Column({length: 100})
    @Field()
    receiptNo: string;
    
    @Column({length: 100})
    @Field()
    poNo: string;

    @Column({type: "text", nullable: true})
    @Field({nullable: true})
    remark: string;

    @Column({nullable: true})
    @Field()
    userId: number;

    @ManyToOne(type => Status, status => status.inboundItems)
    @Field(type => Status)
    @JoinColumn({ name: "status_code", referencedColumnName: "code" })
    status: Status;

    @Column({length: 100, nullable: false})
    @Field()
    statusCode: string;

    @OneToMany(type => InboundItem, items => items.inbound)
    @Field(type => [InboundItem], {nullable: true})
    items: InboundItem[];
}

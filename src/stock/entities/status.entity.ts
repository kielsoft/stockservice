import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Inbound, Outbound } from './';
import { ObjectType, Field } from '@nestjs/graphql';
import { StockCount } from './stock_count.entity';
import { StockTransfer } from './stock_transfer.entity';


@Entity()
@ObjectType()
@Index('UNIQ_status_code', ['code'], { unique: true})
export class Status extends BaseEntity {

    static readonly CODE = {
        approved: "approved",
        pending: "pending",
        received: "received",
        completed: "completed",
        cancelled: "cancelled",
    }

    @PrimaryGeneratedColumn()
    @Field()
    id: number;

    @Column({length: 100, nullable: false})
    @Field()
    code: string;

    @Column({length: 100, nullable: false})
    @Field()
    label: string;

    @Column({length: 100, nullable: false})
    @Field()
    stateCode: string;

    @Column({length: 100, nullable: false})
    @Field()
    stateLabel: string;

    @OneToMany(type => Inbound, inbound => inbound.status)
    @Field(type => [Inbound], {nullable: true})
    inboundItems: Inbound[];

    @OneToMany(type => Outbound, outbound => outbound.status)
    @Field(type => [Outbound], {nullable: true})
    outboundItems: Outbound[];

    @OneToMany(type => StockCount, stockCount => stockCount.status)
    @Field(type => [Outbound], {nullable: true})
    stockCounts: Outbound[];
   
    @OneToMany(type => StockTransfer, st => st.status)
    @Field(type => [StockTransfer], {nullable: true})
    transferredItems: StockTransfer[];
}
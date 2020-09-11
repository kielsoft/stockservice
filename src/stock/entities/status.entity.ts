import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Inbound } from './inbound.entity';
import { ObjectType, Field } from '@nestjs/graphql';


@Entity()
@ObjectType()
@Index('UNIQ_status_code', ['code'], { unique: true})
export class Status extends BaseEntity {

    static readonly CODE = {
        pending: "pending",
        received: "received",
        completed: "completed",
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
}
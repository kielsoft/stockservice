import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { WarehouseLocation } from './';
import { ObjectType, Field } from '@nestjs/graphql';
import { Status } from './status.entity';

@Entity()
@ObjectType()
export class StockCount extends BaseEntity {
    @PrimaryGeneratedColumn()
    @Field()
    id: number;
    
    @ManyToOne(type => WarehouseLocation, locations => locations.stockCounts)
    @Field(type => WarehouseLocation)
    warehouseLocation: WarehouseLocation;

    @Column({length: 100, nullable: false})
    @Field()
    referenceId: string;

    @Column()
    @Field()
    warehouseLocationId: number

    @Column({length: 100, nullable: false, })
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

    @Column({nullable: true})
    @Field({nullable: true})
    approvedQty?: number;
    
    @Column({nullable: true})
    @Field({nullable: true})
    approvedById?: number;
    
    @Column({type: 'text', nullable: true})
    @Field({nullable: true})
    remark: string;

    @ManyToOne(type => Status, status => status.stockCounts)
    @Field(type => Status)
    @JoinColumn({ name: "status_code", referencedColumnName: "code" })
    status: Status;

    @Column({length: 100, nullable: false})
    @Field()
    statusCode: string;
}

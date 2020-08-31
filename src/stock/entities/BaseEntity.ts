import { BaseEntity as TypeormBaseEntity, Column, BeforeInsert, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Validator } from 'validator.ts/Validator';
import { ValidationErrorInterface } from 'validator.ts/ValidationErrorInterface';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ObjectType } from '@nestjs/graphql';

const validator = new Validator();

@ObjectType()
export class BaseEntity extends TypeormBaseEntity{
    
    @CreateDateColumn({ type: 'datetime', precision: 0, nullable: true, default: () => 'CURRENT_TIMESTAMP'})
    createdAt: Date;

    @UpdateDateColumn({type: "timestamp", precision: 0, nullable: true, default: () => 'CURRENT_TIMESTAMP', onUpdate: "CURRENT_TIMESTAMP"})
    updatedAt: Date;

    validate(throwIfError=true): ValidationErrorInterface[] {
        let errors = validator.validate(this);
        if(errors && errors.length){
            if(throwIfError){
                throw new HttpException({
                    status: 'error',
                    message: errors[0].errorMessage,
                    data: errors
                }, HttpStatus.BAD_REQUEST);
            }

            return (errors && errors.length)? errors : null;
        }
        
        return null;
    }

    load(data: any) {
        if (data && typeof data == "object") {
            Object.assign(this, data);
        }
        return this;
    }

  }
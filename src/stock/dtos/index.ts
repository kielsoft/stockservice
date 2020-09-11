import { ObjectType, Field } from "@nestjs/graphql";

export * from "./warehouse";
export * from "./inbound";
export * from "./stock_count";


@ObjectType()
export class OK {
    @Field()
    ok: boolean;
}
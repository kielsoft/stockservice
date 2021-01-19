import { ObjectType, Field } from "@nestjs/graphql";

export * from "./common";
export * from "./warehouse";
export * from "./inbound";
export * from "./outbound";
export * from "./stock_count";
export * from "./stock_transfer";


@ObjectType()
export class OK {
    @Field()
    ok: boolean;
}
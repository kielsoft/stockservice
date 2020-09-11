import { InputType, Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class PaginationResponseData {
    @Field()
    pages: number;

    @Field()
    page: number;

    @Field()
    count: number;

    @Field()
    limit: number;
}

@InputType()
export class PaginationInputData {
    @Field({nullable: true, defaultValue: 1})
    page?: number;

    @Field({nullable: true, defaultValue: 50})
    limit?: number;
}
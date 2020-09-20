
import { Resolver, Query, Args, Mutation } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard, IJwtUserData, CurrentUser } from "../../auth.module";
import { CommonService, InboundService } from "../services";
import {
    InboundCreateInput, InboundFetchInput, InboundItemFetchInput, InboundPutAwayInput,
    InboundFetchResponseData, PoItemsFetchInput, LoginInput, AuthenticationData, PoItemData
} from "../dtos";
import { Inbound } from "../entities";

@Resolver(of => Inbound)
export class InboundResolver {
    constructor(
        private readonly inboundService: InboundService,
        private readonly commonService: CommonService,
    ) { }

    @Mutation(returns => AuthenticationData)
    async authenticate(@Args("loginInput") loginInput: LoginInput) {
        return this.commonService.login(loginInput);
    }

    @UseGuards(JwtAuthGuard)
    @Query(returns => [PoItemData])
    async getPOItems(@Args("poItemsFetchInput") poItemsFetchInput: PoItemsFetchInput) {
        return this.commonService.getPoDetail(poItemsFetchInput);
    }

    @UseGuards(JwtAuthGuard)
    @Query(returns => InboundFetchResponseData)
    async goodsReceipts(@Args("inboundFetchInput", { nullable: true }) inboundFetchInput?: InboundFetchInput) {
        return this.inboundService.fetchAll(inboundFetchInput);
    }

    @UseGuards(JwtAuthGuard)
    @Query(returns => InboundFetchResponseData)
    async goodsReceiptItems(@Args("inboundItemFetchInput", { nullable: true }) inboundItemFetchInput?: InboundItemFetchInput) {
        return this.inboundService.fetchAllItems(inboundItemFetchInput);
    }

    @UseGuards(JwtAuthGuard)
    @Query(returns => Inbound)
    async goodsReceipt(@Args("id", { nullable: false }) id: number) {
        return this.inboundService.getOne({ id });
    }

    @UseGuards(JwtAuthGuard)
    @Mutation(returns => Inbound)
    async createGoodsReceipt(@Args("inboundCreateInput") inboundCreateInput: InboundCreateInput, @CurrentUser() userData: IJwtUserData) {
        inboundCreateInput.userId = Number(userData.user_id);
        return await this.inboundService.create(inboundCreateInput);
    }

    @UseGuards(JwtAuthGuard)
    @Mutation(returns => Inbound)
    async putAwayGoodsReceipt(@Args("inboundPutAwayInput") inboundPutAwayInput: InboundPutAwayInput, @CurrentUser() userData: IJwtUserData) {
        inboundPutAwayInput.putawayBy = Number(userData.user_id);
        return await this.inboundService.putAway(inboundPutAwayInput);
    }

}
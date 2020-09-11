
import { Resolver, Query, Args, Mutation } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard, IJwtUserData, CurrentUser } from "../../auth.module";
import { InboundService } from "../services";
import { InboundCreateInput, InboundFetchInput, InboundItemFetchInput, InboundPutAwayInput, InboundFetchResponseData } from "../dtos";
import { Inbound } from "../entities";

@Resolver(of => Inbound)
@UseGuards(JwtAuthGuard)
export class InboundResolver {
  constructor(
      private readonly inboundService: InboundService,
  ) {}

  @Query(returns => InboundFetchResponseData)
  async goodsReceipts(@Args("inboundFetchInput", {nullable: true}) inboundFetchInput?: InboundFetchInput) {
      return this.inboundService.fetchAll(inboundFetchInput);
  }
  
  @Query(returns => InboundFetchResponseData)
  async goodsReceiptItems(@Args("inboundItemFetchInput", {nullable: true}) inboundItemFetchInput?: InboundItemFetchInput) {
      return this.inboundService.fetchAllItems(inboundItemFetchInput);
  }

  @Query(returns => Inbound)
  async goodsReceipt(@Args("id", {nullable: false}) id: number) {
      return this.inboundService.getOne({id});
  }

  @Mutation(returns => Inbound)
  async createGoodsReceipts(@Args("inboundCreateInput") inboundCreateInput: InboundCreateInput, @CurrentUser() userData: IJwtUserData){
      inboundCreateInput.createdBy = Number(userData.user_id);
      return await this.inboundService.create(inboundCreateInput);
  }
  
  @Mutation(returns => Inbound)
  async putAwayGoodsReceipts(@Args("inboundPutAwayInput") inboundPutAwayInput: InboundPutAwayInput, @CurrentUser() userData: IJwtUserData){
    inboundPutAwayInput.putawayBy = Number(userData.user_id);
      return await this.inboundService.putAway(inboundPutAwayInput);
  }

}
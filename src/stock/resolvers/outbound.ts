
import { Resolver, Query, Args, Mutation } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard, IJwtUserData, CurrentUser } from "../../auth.module";
import { OutboundService } from "../services";
import { OutboundCreateInput, OutboundFetchInput, OutboundItemFetchInput, OutboundPickInput, OutboundFetchResponseData } from "../dtos";
import { Outbound } from "../entities";

@Resolver(of => Outbound)
@UseGuards(JwtAuthGuard)
export class OutboundResolver {
  constructor(
      private readonly outboundService: OutboundService,
  ) {}

  @Query(returns => OutboundFetchResponseData)
  async goodsReleases(@Args("outboundFetchInput", {nullable: true}) outboundFetchInput?: OutboundFetchInput) {
      return this.outboundService.fetchAll(outboundFetchInput);
  }
  
  @Query(returns => OutboundFetchResponseData)
  async goodsReleaseItems(@Args("outboundItemFetchInput", {nullable: true}) outboundItemFetchInput?: OutboundItemFetchInput) {
      return this.outboundService.fetchAllItems(outboundItemFetchInput);
  }

  @Query(returns => Outbound)
  async goodsRelease(@Args("id", {nullable: false}) id: number) {
      return this.outboundService.getOne({id});
  }

  @Mutation(returns => Outbound)
  async createGoodsRelease(@Args("outboundCreateInput") outboundCreateInput: OutboundCreateInput, @CurrentUser() userData: IJwtUserData){
      outboundCreateInput.userId = Number(userData.user_id);
      return await this.outboundService.create(outboundCreateInput);
  }
  
  @Mutation(returns => Outbound)
  async pickAndRelease(@Args("pickData") outboundPickAndReleaseInput: OutboundPickInput, @CurrentUser() userData: IJwtUserData){
    outboundPickAndReleaseInput.pickerId = Number(userData.user_id);
      return await this.outboundService.pickAndRelease(outboundPickAndReleaseInput);
  }

}
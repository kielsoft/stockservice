
import { Resolver, Query, Args, Mutation } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard, IJwtUserData, CurrentUser } from "../../auth.module";
import { CommonService, OutboundService } from "../services";
import { OutboundCreateInput, OutboundFetchInput, OutboundItemFetchInput, OutboundPickInput, OutboundFetchResponseData, OutboundItemFetchResponseData } from "../dtos";
import { Outbound } from "../entities";

@Resolver(of => Outbound)
@UseGuards(JwtAuthGuard)
export class OutboundResolver {
  constructor(
      private readonly outboundService: OutboundService,
      private readonly commonService: CommonService,
  ) {}

  @Query(returns => OutboundFetchResponseData)
  async goodsReleases(@CurrentUser() userData: IJwtUserData, @Args("outboundFetchInput", {nullable: true}) outboundFetchInput?: OutboundFetchInput) {
      let data = await this.outboundService.fetchAll(outboundFetchInput);
      if(!data?.pages && outboundFetchInput?.requestNo){
          return this.commonService.pullOutboundItems(outboundFetchInput.requestNo).then(record => {
              return this.outboundService.generateRequisitionRequest(record, Number(userData.user_id)).catch(error => {
                  console.log(error);
                  return data;
              })
          });
      } 
      return data;
  }
  
  @Query(returns => OutboundItemFetchResponseData)
  async goodsReleaseItems(@Args("outboundItemFetchInput", {nullable: true}) outboundItemFetchInput?: OutboundItemFetchInput) {
      return this.outboundService.fetchAllItems(outboundItemFetchInput);
  }

  @Query(returns => Outbound)
  async goodsRelease(@Args("id") id: number) {
      return this.outboundService.getOne({id});
  }

  @Mutation(returns => Outbound)
  async createGoodsRelease(@Args("outboundCreateInput") outboundCreateInput: OutboundCreateInput, @CurrentUser() userData: IJwtUserData){
      outboundCreateInput.userId = Number(userData.user_id);
      return await this.outboundService.create(outboundCreateInput);
  }
  
  @Mutation(returns => Outbound)
  async pickAndRelease(@Args("request") request: OutboundPickInput, @CurrentUser() userData: IJwtUserData){
    request.pickerId = Number(userData.user_id);
      return await this.outboundService.pickAndRelease(request);
  }

}
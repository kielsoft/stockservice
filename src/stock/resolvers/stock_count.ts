
import { Resolver, Query, Args, Mutation } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard, IJwtUserData, CurrentUser } from "../../auth.module";
import { StockCountService } from "../services";
import { StockCountFetchResponseData, StockCountFetchInput, StockCountCreateInput } from "../dtos";
import { StockCount } from "../entities";

@Resolver(of => StockCount)
@UseGuards(JwtAuthGuard)
export class StockCountResolver {
  constructor(
      private readonly stockCountService: StockCountService,
  ) {}

  @Query(returns => StockCountFetchResponseData)
  async stockCounts(@Args("stockCountFetchInput", {nullable: true}) stockCountFetchInput?: StockCountFetchInput) {
      return this.stockCountService.fetchAll(stockCountFetchInput);
  }

  @Mutation(returns => StockCount)
  async deleteStockCount(@Args("id", {nullable: false}) id: number) {
      return this.stockCountService.getOne({id});
  }

  @Mutation(returns => StockCount)
  async createStockCount(@Args("stockCountCreateInput") stockCountCreateInput: StockCountCreateInput, @CurrentUser() userData: IJwtUserData){
      stockCountCreateInput.userId = Number(userData.user_id);
      return await this.stockCountService.create(stockCountCreateInput);
  }
  


}
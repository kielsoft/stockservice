
import { Resolver, Query, Args, Mutation } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard, IJwtUserData, CurrentUser } from "../../auth.module";
import { StockCountService, WarehouseLocationService } from "../services";
import { StockCountFetchResponseData, StockCountFetchInput, StockCountCreateInput, StockCountCancelInput, OK } from "../dtos";
import { StockCount } from "../entities";

@Resolver(of => StockCount)
@UseGuards(JwtAuthGuard)
export class StockCountResolver {
  constructor(
      private readonly stockCountService: StockCountService,
      private readonly warehouseLocationService: WarehouseLocationService,
  ) {}

  @Query(returns => StockCountFetchResponseData)
  async stockCounts(@Args("request", {nullable: true}) stockCountFetchInput?: StockCountFetchInput) {
      const data = await this.stockCountService.fetchAll(stockCountFetchInput);
      if(stockCountFetchInput?.warehouseLocationId){
          data.warehouseLocation = await this.warehouseLocationService.getOne({id: stockCountFetchInput?.warehouseLocationId}, false)
          .catch(error => {
              throw new Error("Unknown warehouse location ID");
          })
      }

      return data;
  }

  @Mutation(returns => StockCount)
  async stockCount(@Args("id", {nullable: false}) id: number) {
      return this.stockCountService.getOne({id});
  }

  @Mutation(returns => StockCount)
  async createStockCount(@Args("request") stockCountCreateInput: StockCountCreateInput, @CurrentUser() userData: IJwtUserData){
      stockCountCreateInput.userId = Number(userData.user_id);
      return this.stockCountService.create(stockCountCreateInput);
  }

  @Mutation(returns => OK)
  async cancelStockCount(@Args("request") request: StockCountCancelInput, @CurrentUser() userData: IJwtUserData){
    request.userId = Number(userData.user_id);
    return this.stockCountService.cancel(request);
  }
  


}
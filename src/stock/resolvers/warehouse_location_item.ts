import { Resolver, Query, Args, Mutation } from "@nestjs/graphql";
import { WarehouseLocationItem } from "../entities";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth.module";
import { WarehouseLocationItemService } from "../services";
import { WarehouseLocationItemFetchInput, WarehouseLocationItemCreateInput, WarehouseLocationItemUpdateInput, WarehouseLocationItemFetchResponseData } from "../dtos";

@Resolver(of => WarehouseLocationItem)
@UseGuards(JwtAuthGuard)
export class WarehouseLocationItemResolver {
  constructor(
      private readonly warehouseLocationItemService: WarehouseLocationItemService,
  ) {}

  @Query(returns => WarehouseLocationItemFetchResponseData)
  async warehouseLocationItems(@Args("request", {nullable: true}) warehouseLocationItemFetchInput?: WarehouseLocationItemFetchInput) {
      return this.warehouseLocationItemService.fetchAll(warehouseLocationItemFetchInput);
  }

  @Query(returns => WarehouseLocationItem)
  async warehouseLocationItem(@Args("id", {nullable: false}) id: number) {
      return this.warehouseLocationItemService.getOne({id});
  }

  @Mutation(returns => WarehouseLocationItem)
  async addWarehouseLocationItem(@Args("request") warehouseLocationItemCreateInput: WarehouseLocationItemCreateInput){
      return await this.warehouseLocationItemService.create(warehouseLocationItemCreateInput);
  }
  
  @Mutation(returns => WarehouseLocationItem)
  async updateWarehouseLocationItem(@Args("request", {}) warehouseLocationItemUpdateInput: WarehouseLocationItemUpdateInput){
      return await this.warehouseLocationItemService.update(warehouseLocationItemUpdateInput);
  }

}
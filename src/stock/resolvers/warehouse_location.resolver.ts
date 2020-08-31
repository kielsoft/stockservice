import { WarehouseLocationFetchInput, WarehouseLocationCreateInput, WarehouseLocationUpdateInput } from "../dtos";
import { Resolver, Query, Args, Mutation } from "@nestjs/graphql";
import { WarehouseLocation } from "../entities";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth.module";
import { WarehouseLocationService } from "../services/warehouse_location";

@Resolver(of => WarehouseLocation)
@UseGuards(JwtAuthGuard)
export class WarehouseLocationResolver {
  constructor(
      private readonly warehouseLocationService: WarehouseLocationService,
  ) {}

  @Query(returns => [WarehouseLocation])
  async warehouseLocations(@Args("warehouseLocationFetchInput", {nullable: true}) warehouseLocationFetchInput?: WarehouseLocationFetchInput) {
      return this.warehouseLocationService.fetchAll(warehouseLocationFetchInput);
  }

  @Query(returns => WarehouseLocation)
  async warehouseLocation(@Args("id", {nullable: false}) id: number) {
      return this.warehouseLocationService.getOne({id});
  }

  @Mutation(returns => WarehouseLocation)
  async addWarehouseLocation(@Args("warehouseLocationCreateInput") warehouseLocationCreateInput: WarehouseLocationCreateInput){
      return await this.warehouseLocationService.create(warehouseLocationCreateInput);
  }
  
  @Mutation(returns => WarehouseLocation)
  async updateWarehouseLocation(@Args("warehouseLocationUpdateInput", {}) warehouseLocationUpdateInput: WarehouseLocationUpdateInput){
      return await this.warehouseLocationService.update(warehouseLocationUpdateInput);
  }

}
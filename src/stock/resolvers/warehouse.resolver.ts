import { WarehouseCreateInput, WarehouseUpdateInput, WarehouseFetchInput, WarehouseLocationFetchInput, WarehouseLocationCreateInput, WarehouseLocationUpdateInput } from "../dtos";
import { Resolver, Query, Args, Mutation } from "@nestjs/graphql";
import { WarehouseService } from "../services";
import { Warehouse } from "../entities";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth.module";

@Resolver(of => Warehouse)
@UseGuards(JwtAuthGuard)
export class WarehouseResolver {
  constructor(
      private readonly warehouseService: WarehouseService,
  ) {}

  // Warehouse

  @Query(returns => [Warehouse])
  async warehouses(@Args("warehouseFetchInput", {nullable: true}) warehouseFetchInput?: WarehouseFetchInput) {
      return this.warehouseService.fetchAll(warehouseFetchInput);
  }

  @Query(returns => Warehouse)
  async warehouse(@Args("id", {nullable: false}) id: number) {
      return this.warehouseService.getOne({id});
  }

  @Mutation(returns => Warehouse)
  async addWarehouse(@Args("warehouseCreateInput") warehouseCreateInput: WarehouseCreateInput){
      return await this.warehouseService.create(warehouseCreateInput);
  }
  
  @Mutation(returns => Warehouse)
  async updateWarehouse(@Args("warehouseUpdateInput", {}) warehouseUpdateInput: WarehouseUpdateInput){
      return await this.warehouseService.update(warehouseUpdateInput);
  }

}

import { Resolver, Query, Args, Mutation } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard, IJwtUserData, CurrentUser } from "../../auth.module";
import { CommonService, StockTransferService, WarehouseLocationService } from "../services";
import { StockTransfer } from "../entities";
import { StockTransferCancelInput, StockTransferCreateInput, StockTransferFetchInput, StockTransferFetchResponseData, StockTransferReceiveInput, OK } from "../dtos";

@Resolver(of => StockTransfer)
@UseGuards(JwtAuthGuard)
export class StockTransferResolver {
    constructor(
        private readonly service: StockTransferService,
        private readonly warehouseLocationService: WarehouseLocationService,
    ) { }

    @Query(returns => StockTransferFetchResponseData)
    async stockTransferItems(@CurrentUser() userData: IJwtUserData, @Args("request", { nullable: true }) request?: StockTransferFetchInput) {
        let data = await this.service.fetchAll(request);
        if(request?.toWarehouseLocationId){
            data.warehouseLocation = await this.warehouseLocationService.getOne({id: request?.toWarehouseLocationId}, false)
            .catch(error => {
                throw new Error("Unknown receiving warehouse location ID");
            })
        }
        return data;
    }


    @Query(returns => StockTransfer)
    async stockTransferItem(@Args("id") id: number) {
        return this.service.getOne({ id });
    }

    @Mutation(returns => [StockTransfer])
    async createStockTranferItems(@Args({name: 'items', type: () => [StockTransferCreateInput]}) items: StockTransferCreateInput[], @CurrentUser() userData: IJwtUserData) {
        items.map(i => {
            i.transferredById = Number(userData.user_id);
            return i;
        });

        return await this.service.createItems(items);
    }

    @Mutation(returns => [StockTransfer])
    async receiveStockTransferItems(@Args({name: 'items', type: () => [StockTransferReceiveInput]}) items: StockTransferReceiveInput[], @CurrentUser() userData: IJwtUserData) {
        items.map(i => {
            i.receivedById = Number(userData.user_id);
            return i;
        });
        return await this.service.receiveItems(items);
    }

    @Mutation(returns => OK)
    async cancelStockTransferItem(@Args("items") item: StockTransferCancelInput, @CurrentUser() userData: IJwtUserData) {
        item.userId = Number(userData.user_id);
        return this.service.cancel(item);
    }

}
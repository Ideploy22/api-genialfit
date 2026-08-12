/**
 * Route types for the "Configuration" tag.
 * Auto-generated from cloudgym.json. Do not edit by hand.
 */
import type {
  OperationParams,
  OperationPayload,
  OperationResponse,
} from "./helpers";

/** GET /config/units — Get all units */
export type GetAllUnitsParams = OperationParams<"getAllUnits">;
export type GetAllUnitsPayload = OperationPayload<"getAllUnits">;
export type GetAllUnitsResponse = OperationResponse<"getAllUnits">;

/** PUT /config/units — Update unit */
export type UpdateUnitParams = OperationParams<"updateUnit">;
export type UpdateUnitPayload = OperationPayload<"updateUnit">;
export type UpdateUnitResponse = OperationResponse<"updateUnit">;

/** POST /config/units — Create new unit */
export type NewUnitParams = OperationParams<"newUnit">;
export type NewUnitPayload = OperationPayload<"newUnit">;
export type NewUnitResponse = OperationResponse<"newUnit">;

/** PUT /config/salesfunnel — Update sales funnel */
export type UpdateSalesFunnelParams = OperationParams<"updateSalesFunnel">;
export type UpdateSalesFunnelPayload = OperationPayload<"updateSalesFunnel">;
export type UpdateSalesFunnelResponse = OperationResponse<"updateSalesFunnel">;

/** POST /config/salesfunnel — Create new sales funnel */
export type NewSalesFunnelParams = OperationParams<"newSalesFunnel">;
export type NewSalesFunnelPayload = OperationPayload<"newSalesFunnel">;
export type NewSalesFunnelResponse = OperationResponse<"newSalesFunnel">;

/** PUT /config/room — Update room */
export type UpdateRoomParams = OperationParams<"updateRoom">;
export type UpdateRoomPayload = OperationPayload<"updateRoom">;
export type UpdateRoomResponse = OperationResponse<"updateRoom">;

/** POST /config/room — Create room */
export type CreateRoomParams = OperationParams<"createRoom">;
export type CreateRoomPayload = OperationPayload<"createRoom">;
export type CreateRoomResponse = OperationResponse<"createRoom">;

/** PUT /config/product — Update product */
export type UpdateProductParams = OperationParams<"updateProduct">;
export type UpdateProductPayload = OperationPayload<"updateProduct">;
export type UpdateProductResponse = OperationResponse<"updateProduct">;

/** POST /config/product — Create new product */
export type NewProductParams = OperationParams<"newProduct">;
export type NewProductPayload = OperationPayload<"newProduct">;
export type NewProductResponse = OperationResponse<"newProduct">;

/** PUT /config/plan — Update plan */
export type UpdatePlanParams = OperationParams<"updatePlan">;
export type UpdatePlanPayload = OperationPayload<"updatePlan">;
export type UpdatePlanResponse = OperationResponse<"updatePlan">;

/** POST /config/plan — Create new plan */
export type NewPlanParams = OperationParams<"newPlan">;
export type NewPlanPayload = OperationPayload<"newPlan">;
export type NewPlanResponse = OperationResponse<"newPlan">;

/** PUT /config/offer — Update offer */
export type UpdateOfferParams = OperationParams<"updateOffer">;
export type UpdateOfferPayload = OperationPayload<"updateOffer">;
export type UpdateOfferResponse = OperationResponse<"updateOffer">;

/** POST /config/offer — Create new offer */
export type NewOfferParams = OperationParams<"newOffer">;
export type NewOfferPayload = OperationPayload<"newOffer">;
export type NewOfferResponse = OperationResponse<"newOffer">;

/** PUT /config/chartaccount — Update chart account */
export type UpdateChartAccountParams = OperationParams<"updateChartAccount">;
export type UpdateChartAccountPayload = OperationPayload<"updateChartAccount">;
export type UpdateChartAccountResponse =
  OperationResponse<"updateChartAccount">;

/** POST /config/chartaccount — Create new chart account */
export type NewChartAccountParams = OperationParams<"newChartAccount">;
export type NewChartAccountPayload = OperationPayload<"newChartAccount">;
export type NewChartAccountResponse = OperationResponse<"newChartAccount">;

/** PUT /config/bank — Update bank */
export type UpdateBankParams = OperationParams<"updateBank">;
export type UpdateBankPayload = OperationPayload<"updateBank">;
export type UpdateBankResponse = OperationResponse<"updateBank">;

/** POST /config/bank — Create new bank */
export type NewBankParams = OperationParams<"newBank">;
export type NewBankPayload = OperationPayload<"newBank">;
export type NewBankResponse = OperationResponse<"newBank">;

/** POST /config/offers/upload-all-to-s3 — Upload all active offers to S3 */
export type UploadAllActiveOffersToS3Params =
  OperationParams<"uploadAllActiveOffersToS3">;
export type UploadAllActiveOffersToS3Payload =
  OperationPayload<"uploadAllActiveOffersToS3">;
export type UploadAllActiveOffersToS3Response =
  OperationResponse<"uploadAllActiveOffersToS3">;

/** GET /config/units/{id} — Get unit by ID */
export type GetUnitParams = OperationParams<"getUnit">;
export type GetUnitPayload = OperationPayload<"getUnit">;
export type GetUnitResponse = OperationResponse<"getUnit">;

/** DELETE /config/units/{id} — Delete unit */
export type DeleteUnitParams = OperationParams<"deleteUnit">;
export type DeleteUnitPayload = OperationPayload<"deleteUnit">;
export type DeleteUnitResponse = OperationResponse<"deleteUnit">;

/** GET /config/salesfunnels — Get all sales funnels */
export type GetAllSalesFunnelsParams = OperationParams<"getAllSalesFunnels">;
export type GetAllSalesFunnelsPayload = OperationPayload<"getAllSalesFunnels">;
export type GetAllSalesFunnelsResponse =
  OperationResponse<"getAllSalesFunnels">;

/** GET /config/salesfunnel/{id} — Get sales funnel by ID */
export type GetSalesFunnelParams = OperationParams<"getSalesFunnel">;
export type GetSalesFunnelPayload = OperationPayload<"getSalesFunnel">;
export type GetSalesFunnelResponse = OperationResponse<"getSalesFunnel">;

/** DELETE /config/salesfunnel/{id} — Delete sales funnel */
export type DeleteSalesFunnelParams = OperationParams<"deleteSalesFunnel">;
export type DeleteSalesFunnelPayload = OperationPayload<"deleteSalesFunnel">;
export type DeleteSalesFunnelResponse = OperationResponse<"deleteSalesFunnel">;

/** GET /config/rooms/{unitId} — List rooms for unit */
export type ListRoomsParams = OperationParams<"listRooms">;
export type ListRoomsPayload = OperationPayload<"listRooms">;
export type ListRoomsResponse = OperationResponse<"listRooms">;

/** GET /config/products/{unitId} — Get all products */
export type GetAllProductsParams = OperationParams<"getAllProducts">;
export type GetAllProductsPayload = OperationPayload<"getAllProducts">;
export type GetAllProductsResponse = OperationResponse<"getAllProducts">;

/** GET /config/product/{id} — Get product by ID */
export type GetProductParams = OperationParams<"getProduct">;
export type GetProductPayload = OperationPayload<"getProduct">;
export type GetProductResponse = OperationResponse<"getProduct">;

/** DELETE /config/product/{id} — Delete product */
export type DeleteProductParams = OperationParams<"deleteProduct">;
export type DeleteProductPayload = OperationPayload<"deleteProduct">;
export type DeleteProductResponse = OperationResponse<"deleteProduct">;

/** GET /config/plans/{unitId} — Get all plans */
export type GetAllPlansParams = OperationParams<"getAllPlans">;
export type GetAllPlansPayload = OperationPayload<"getAllPlans">;
export type GetAllPlansResponse = OperationResponse<"getAllPlans">;

/** GET /config/plan/{id} — Get plan by ID */
export type GetPlanParams = OperationParams<"getPlan">;
export type GetPlanPayload = OperationPayload<"getPlan">;
export type GetPlanResponse = OperationResponse<"getPlan">;

/** DELETE /config/plan/{id} — Delete plan */
export type DeletePlanParams = OperationParams<"deletePlan">;
export type DeletePlanPayload = OperationPayload<"deletePlan">;
export type DeletePlanResponse = OperationResponse<"deletePlan">;

/** GET /config/offers/{unitId} — Get all offers */
export type GetAllOffersParams = OperationParams<"getAllOffers">;
export type GetAllOffersPayload = OperationPayload<"getAllOffers">;
export type GetAllOffersResponse = OperationResponse<"getAllOffers">;

/** GET /config/offer/{id} — Get offer by ID */
export type GetOfferParams = OperationParams<"getOffer">;
export type GetOfferPayload = OperationPayload<"getOffer">;
export type GetOfferResponse = OperationResponse<"getOffer">;

/** DELETE /config/offer/{id} — Delete offer */
export type DeleteOfferParams = OperationParams<"deleteOffer">;
export type DeleteOfferPayload = OperationPayload<"deleteOffer">;
export type DeleteOfferResponse = OperationResponse<"deleteOffer">;

/** GET /config/chartaccounts — Get all chart accounts */
export type GetAllChartAccountsParams = OperationParams<"getAllChartAccounts">;
export type GetAllChartAccountsPayload =
  OperationPayload<"getAllChartAccounts">;
export type GetAllChartAccountsResponse =
  OperationResponse<"getAllChartAccounts">;

/** GET /config/chartaccount/{id} — Get chart account by ID */
export type GetChartAccountParams = OperationParams<"getChartAccount">;
export type GetChartAccountPayload = OperationPayload<"getChartAccount">;
export type GetChartAccountResponse = OperationResponse<"getChartAccount">;

/** DELETE /config/chartaccount/{id} — Delete chart account */
export type DeleteChartAccountParams = OperationParams<"deleteChartAccount">;
export type DeleteChartAccountPayload = OperationPayload<"deleteChartAccount">;
export type DeleteChartAccountResponse =
  OperationResponse<"deleteChartAccount">;

/** GET /config/banks/{unitId} — Get all banks */
export type GetAllBanksParams = OperationParams<"getAllBanks">;
export type GetAllBanksPayload = OperationPayload<"getAllBanks">;
export type GetAllBanksResponse = OperationResponse<"getAllBanks">;

/** GET /config/bank/{id} — Get bank by ID */
export type GetBankParams = OperationParams<"getBank">;
export type GetBankPayload = OperationPayload<"getBank">;
export type GetBankResponse = OperationResponse<"getBank">;

/** DELETE /config/bank/{id} — Delete bank */
export type DeleteBankParams = OperationParams<"deleteBank">;
export type DeleteBankPayload = OperationPayload<"deleteBank">;
export type DeleteBankResponse = OperationResponse<"deleteBank">;

/** DELETE /config/room/{id} — Delete room */
export type DeleteRoomParams = OperationParams<"deleteRoom">;
export type DeleteRoomPayload = OperationPayload<"deleteRoom">;
export type DeleteRoomResponse = OperationResponse<"deleteRoom">;

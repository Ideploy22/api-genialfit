/**
 * Route types for the "Report" tag.
 * Auto-generated from cloudgym.json. Do not edit by hand.
 */
import type {
  OperationParams,
  OperationPayload,
  OperationResponse,
} from "./helpers";

/** GET /report/stats/{unitId}/{day} — Get dashboard statistics */
export type GetStatisticsParams = OperationParams<"getStatistics">;
export type GetStatisticsPayload = OperationPayload<"getStatistics">;
export type GetStatisticsResponse = OperationResponse<"getStatistics">;

/** GET /report/inactivecustomers/{unitId} — Get inactive customers */
export type GetInactiveCustomersParams =
  OperationParams<"getInactiveCustomers">;
export type GetInactiveCustomersPayload =
  OperationPayload<"getInactiveCustomers">;
export type GetInactiveCustomersResponse =
  OperationResponse<"getInactiveCustomers">;

/** GET /report/goal/{unitId}/{salesId}/{begin}/{end} — Get goal view */
export type GetGoalViewParams = OperationParams<"getGoalView">;
export type GetGoalViewPayload = OperationPayload<"getGoalView">;
export type GetGoalViewResponse = OperationResponse<"getGoalView">;

/** GET /report/finantial/{unitId}/{begin}/{end} — Get financial view */
export type GetFinantialViewParams = OperationParams<"getFinantialView">;
export type GetFinantialViewPayload = OperationPayload<"getFinantialView">;
export type GetFinantialViewResponse = OperationResponse<"getFinantialView">;

/** GET /report/crm/{unitId}/{begin}/{end} — Get CRM view */
export type GetCRMViewParams = OperationParams<"getCRMView">;
export type GetCRMViewPayload = OperationPayload<"getCRMView">;
export type GetCRMViewResponse = OperationResponse<"getCRMView">;

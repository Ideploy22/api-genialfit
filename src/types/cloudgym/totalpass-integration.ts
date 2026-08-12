/**
 * Route types for the "TotalPass Integration" tag.
 * Auto-generated from cloudgym.json. Do not edit by hand.
 */
import type {
  OperationParams,
  OperationPayload,
  OperationResponse,
} from "./helpers";

/** POST /api/totalpass/sync/unit/{unitId} — Sync all unit classes to TotalPass */
export type SyncUnitClassesParams = OperationParams<"syncUnitClasses">;
export type SyncUnitClassesPayload = OperationPayload<"syncUnitClasses">;
export type SyncUnitClassesResponse = OperationResponse<"syncUnitClasses">;

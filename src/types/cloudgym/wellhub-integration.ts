/**
 * Route types for the "Wellhub Integration" tag.
 * Auto-generated from cloudgym.json. Do not edit by hand.
 */
import type {
  OperationParams,
  OperationPayload,
  OperationResponse,
} from "./helpers";

/** POST /api/wellhub/sync/unit/{unitId} — Sync all unit classes to Wellhub (auto config) */
export type SyncUnitClassesAutoParams = OperationParams<"syncUnitClassesAuto">;
export type SyncUnitClassesAutoPayload =
  OperationPayload<"syncUnitClassesAuto">;
export type SyncUnitClassesAutoResponse =
  OperationResponse<"syncUnitClassesAuto">;

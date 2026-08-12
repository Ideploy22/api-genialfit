/**
 * Route types for the "Booking" tag.
 * Auto-generated from cloudgym.json. Do not edit by hand.
 */
import type {
  OperationParams,
  OperationPayload,
  OperationResponse,
} from "./helpers";

/** PUT /booking/classes — Update an existing class */
export type UpdateClassParams = OperationParams<"updateClass">;
export type UpdateClassPayload = OperationPayload<"updateClass">;
export type UpdateClassResponse = OperationResponse<"updateClass">;

/** POST /booking/classes — Create a new class */
export type CreateClassParams = OperationParams<"createClass">;
export type CreateClassPayload = OperationPayload<"createClass">;
export type CreateClassResponse = OperationResponse<"createClass">;

/** GET /booking/classes/{unitId} — Get all classes by unit */
export type GetClassesParams = OperationParams<"getClasses">;
export type GetClassesPayload = OperationPayload<"getClasses">;
export type GetClassesResponse = OperationResponse<"getClasses">;

/** GET /booking/class/{classId} — Get class by ID */
export type GetClassByIdParams = OperationParams<"getClassById">;
export type GetClassByIdPayload = OperationPayload<"getClassById">;
export type GetClassByIdResponse = OperationResponse<"getClassById">;

/** DELETE /booking/classes/{classId} — Delete a class */
export type DeleteClassParams = OperationParams<"deleteClass">;
export type DeleteClassPayload = OperationPayload<"deleteClass">;
export type DeleteClassResponse = OperationResponse<"deleteClass">;

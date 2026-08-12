/**
 * Route types for the "Administration" tag.
 * Auto-generated from cloudgym.json. Do not edit by hand.
 */
import type {
  OperationParams,
  OperationPayload,
  OperationResponse,
} from "./helpers";

/** GET /admin/users — Get all users */
export type AllParams = OperationParams<"all">;
export type AllPayload = OperationPayload<"all">;
export type AllResponse = OperationResponse<"all">;

/** PUT /admin/users — Update user */
export type UpdateUserParams = OperationParams<"updateUser">;
export type UpdateUserPayload = OperationPayload<"updateUser">;
export type UpdateUserResponse = OperationResponse<"updateUser">;

/** POST /admin/users — Create new user */
export type NewUserParams = OperationParams<"newUser">;
export type NewUserPayload = OperationPayload<"newUser">;
export type NewUserResponse = OperationResponse<"newUser">;

/** GET /admin/users/{id} — Get user by ID */
export type GetUserParams = OperationParams<"getUser">;
export type GetUserPayload = OperationPayload<"getUser">;
export type GetUserResponse = OperationResponse<"getUser">;

/** DELETE /admin/users/{id} — Delete user */
export type DeleteUserParams = OperationParams<"deleteUser">;
export type DeleteUserPayload = OperationPayload<"deleteUser">;
export type DeleteUserResponse = OperationResponse<"deleteUser">;

/** GET /admin/classreservations/{classId}/{cdate}/{ctime} — Get class reservations */
export type GetClassReserListParams = OperationParams<"getClassReserList">;
export type GetClassReserListPayload = OperationPayload<"getClassReserList">;
export type GetClassReserListResponse = OperationResponse<"getClassReserList">;

/** GET /admin/classesattendance/{unitId}/{begin}/{end}/{instructorId} — Get classes attendance */
export type GetClassesAttendanceParams =
  OperationParams<"getClassesAttendance">;
export type GetClassesAttendancePayload =
  OperationPayload<"getClassesAttendance">;
export type GetClassesAttendanceResponse =
  OperationResponse<"getClassesAttendance">;

/** GET /admin/classattendancelist/{unitId}/{date}/{classId} — Get class attendance list */
export type GetClassAttendanceListParams =
  OperationParams<"getClassAttendanceList">;
export type GetClassAttendanceListPayload =
  OperationPayload<"getClassAttendanceList">;
export type GetClassAttendanceListResponse =
  OperationResponse<"getClassAttendanceList">;

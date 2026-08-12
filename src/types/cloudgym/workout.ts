/**
 * Route types for the "Workout" tag.
 * Auto-generated from cloudgym.json. Do not edit by hand.
 */
import type {
  OperationParams,
  OperationPayload,
  OperationResponse,
} from "./helpers";

/** PUT /workout/workoutProgram — Update workout program */
export type UpdateWorkoutProgramParams =
  OperationParams<"updateWorkoutProgram">;
export type UpdateWorkoutProgramPayload =
  OperationPayload<"updateWorkoutProgram">;
export type UpdateWorkoutProgramResponse =
  OperationResponse<"updateWorkoutProgram">;

/** POST /workout/workoutProgram — Create new workout program */
export type CreateWorkoutProgramParams =
  OperationParams<"createWorkoutProgram">;
export type CreateWorkoutProgramPayload =
  OperationPayload<"createWorkoutProgram">;
export type CreateWorkoutProgramResponse =
  OperationResponse<"createWorkoutProgram">;

/** PUT /workout/workoutFlow — Update workout flow */
export type UpdateWorkoutFlowParams = OperationParams<"updateWorkoutFlow">;
export type UpdateWorkoutFlowPayload = OperationPayload<"updateWorkoutFlow">;
export type UpdateWorkoutFlowResponse = OperationResponse<"updateWorkoutFlow">;

/** POST /workout/workoutFlow — Create new workout flow */
export type CreateWorkoutFlowParams = OperationParams<"createWorkoutFlow">;
export type CreateWorkoutFlowPayload = OperationPayload<"createWorkoutFlow">;
export type CreateWorkoutFlowResponse = OperationResponse<"createWorkoutFlow">;

/** PUT /workout/memberObs — Update member workout observation */
export type UpdateMemberObsParams = OperationParams<"updateMemberObs">;
export type UpdateMemberObsPayload = OperationPayload<"updateMemberObs">;
export type UpdateMemberObsResponse = OperationResponse<"updateMemberObs">;

/** PUT /workout/exercise — Update exercise */
export type UpdateExerciseParams = OperationParams<"updateExercise">;
export type UpdateExercisePayload = OperationPayload<"updateExercise">;
export type UpdateExerciseResponse = OperationResponse<"updateExercise">;

/** POST /workout/exercise — Create new exercise */
export type CreateExerciseParams = OperationParams<"createExercise">;
export type CreateExercisePayload = OperationPayload<"createExercise">;
export type CreateExerciseResponse = OperationResponse<"createExercise">;

/** PUT /workout/copyworkout/templateworkout/{name}/{memberId} — Copy workout template for member */
export type CopyWorkoutParams = OperationParams<"copyWorkout">;
export type CopyWorkoutPayload = OperationPayload<"copyWorkout">;
export type CopyWorkoutResponse = OperationResponse<"copyWorkout">;

/** PUT /workout/copyworkout/templatemember/{frommemberId}/{tomemberId} — Copy workout from another member */
export type CopyWorkoutTemplateParams = OperationParams<"copyWorkoutTemplate">;
export type CopyWorkoutTemplatePayload =
  OperationPayload<"copyWorkoutTemplate">;
export type CopyWorkoutTemplateResponse =
  OperationResponse<"copyWorkoutTemplate">;

/** PUT /workout/changeorderworkout/{memberId}/{workoutId}/{newOrder} — Change order of workout exercises */
export type ChangeOrderWorkoutParams = OperationParams<"changeOrderWorkout">;
export type ChangeOrderWorkoutPayload = OperationPayload<"changeOrderWorkout">;
export type ChangeOrderWorkoutResponse =
  OperationResponse<"changeOrderWorkout">;

/** POST /workout/workoutHistory — Create new workout history */
export type CreateWorkoutHistoryParams =
  OperationParams<"createWorkoutHistory">;
export type CreateWorkoutHistoryPayload =
  OperationPayload<"createWorkoutHistory">;
export type CreateWorkoutHistoryResponse =
  OperationResponse<"createWorkoutHistory">;

/** POST /workout/registerMemberTeam/{memberId}/{contractId}/{classId} — Register member team attendances */
export type RegisterMemberTeamParams = OperationParams<"registerMemberTeam">;
export type RegisterMemberTeamPayload = OperationPayload<"registerMemberTeam">;
export type RegisterMemberTeamResponse =
  OperationResponse<"registerMemberTeam">;

/** POST /workout/physicalassessment — Create new physical assessment */
export type CreatePhysicalAssessmentParams =
  OperationParams<"createPhysicalAssessment">;
export type CreatePhysicalAssessmentPayload =
  OperationPayload<"createPhysicalAssessment">;
export type CreatePhysicalAssessmentResponse =
  OperationResponse<"createPhysicalAssessment">;

/** POST /workout/changeflow/{memberId}/{flowId} — Change member workout flow */
export type ChangeMemberWorkoutFlowParams =
  OperationParams<"changeMemberWorkoutFlow">;
export type ChangeMemberWorkoutFlowPayload =
  OperationPayload<"changeMemberWorkoutFlow">;
export type ChangeMemberWorkoutFlowResponse =
  OperationResponse<"changeMemberWorkoutFlow">;

/** GET /workout/workoutsHistory/{memberId} — Get all workout history by member ID */
export type GetWorkoutHistoryParams = OperationParams<"getWorkoutHistory">;
export type GetWorkoutHistoryPayload = OperationPayload<"getWorkoutHistory">;
export type GetWorkoutHistoryResponse = OperationResponse<"getWorkoutHistory">;

/** GET /workout/workoutPrograms — Get all workout programs */
export type GetAllWorkoutProgramsParams =
  OperationParams<"getAllWorkoutPrograms">;
export type GetAllWorkoutProgramsPayload =
  OperationPayload<"getAllWorkoutPrograms">;
export type GetAllWorkoutProgramsResponse =
  OperationResponse<"getAllWorkoutPrograms">;

/** GET /workout/workoutProgram/{id} — Get workout program by ID */
export type GetWorkoutProgramParams = OperationParams<"getWorkoutProgram">;
export type GetWorkoutProgramPayload = OperationPayload<"getWorkoutProgram">;
export type GetWorkoutProgramResponse = OperationResponse<"getWorkoutProgram">;

/** DELETE /workout/workoutProgram/{id} — Delete workout program */
export type DeleteWorkoutProgramParams =
  OperationParams<"deleteWorkoutProgram">;
export type DeleteWorkoutProgramPayload =
  OperationPayload<"deleteWorkoutProgram">;
export type DeleteWorkoutProgramResponse =
  OperationResponse<"deleteWorkoutProgram">;

/** GET /workout/workoutHistory/{id} — Get workout history by ID */
export type GetWorkoutHistory2Params = OperationParams<"getWorkoutHistory_1">;
export type GetWorkoutHistory2Payload = OperationPayload<"getWorkoutHistory_1">;
export type GetWorkoutHistory2Response =
  OperationResponse<"getWorkoutHistory_1">;

/** DELETE /workout/workoutHistory/{id} — Delete workout history */
export type DeleteWorkoutHistoryParams =
  OperationParams<"deleteWorkoutHistory">;
export type DeleteWorkoutHistoryPayload =
  OperationPayload<"deleteWorkoutHistory">;
export type DeleteWorkoutHistoryResponse =
  OperationResponse<"deleteWorkoutHistory">;

/** GET /workout/workoutFlows — Get all workout flows */
export type GetAllWorkoutFlowsParams = OperationParams<"getAllWorkoutFlows">;
export type GetAllWorkoutFlowsPayload = OperationPayload<"getAllWorkoutFlows">;
export type GetAllWorkoutFlowsResponse =
  OperationResponse<"getAllWorkoutFlows">;

/** GET /workout/workoutFlow/{id} — Get workout flow by ID */
export type GetWorkoutFlowParams = OperationParams<"getWorkoutFlow">;
export type GetWorkoutFlowPayload = OperationPayload<"getWorkoutFlow">;
export type GetWorkoutFlowResponse = OperationResponse<"getWorkoutFlow">;

/** DELETE /workout/workoutFlow/{id} — Delete workout flow */
export type DeleteWorkoutFlowParams = OperationParams<"deleteWorkoutFlow">;
export type DeleteWorkoutFlowPayload = OperationPayload<"deleteWorkoutFlow">;
export type DeleteWorkoutFlowResponse = OperationResponse<"deleteWorkoutFlow">;

/** GET /workout/physicalassessments/{memberId} — Get all physical assessments by memberId */
export type GetPhysicalAssessmentsParams =
  OperationParams<"getPhysicalAssessments">;
export type GetPhysicalAssessmentsPayload =
  OperationPayload<"getPhysicalAssessments">;
export type GetPhysicalAssessmentsResponse =
  OperationResponse<"getPhysicalAssessments">;

/** GET /workout/memberWorkout/{memberId} — Get all workouts for a member */
export type GetMemberWorkoutsParams = OperationParams<"getMemberWorkouts">;
export type GetMemberWorkoutsPayload = OperationPayload<"getMemberWorkouts">;
export type GetMemberWorkoutsResponse = OperationResponse<"getMemberWorkouts">;

/** DELETE /workout/memberWorkout/{memberId} — Delete all workouts for a member */
export type DeleteMemberWorkoutsParams =
  OperationParams<"deleteMemberWorkouts">;
export type DeleteMemberWorkoutsPayload =
  OperationPayload<"deleteMemberWorkouts">;
export type DeleteMemberWorkoutsResponse =
  OperationResponse<"deleteMemberWorkouts">;

/** GET /workout/memberObs/{memberId} — Get workout observation by memberId */
export type GetMemberObsParams = OperationParams<"getMemberObs">;
export type GetMemberObsPayload = OperationPayload<"getMemberObs">;
export type GetMemberObsResponse = OperationResponse<"getMemberObs">;

/** GET /workout/exercises — Get all exercises */
export type GetAllExercisesParams = OperationParams<"getAllExercises">;
export type GetAllExercisesPayload = OperationPayload<"getAllExercises">;
export type GetAllExercisesResponse = OperationResponse<"getAllExercises">;

/** GET /workout/exercise/{id} — Get exercise account by ID */
export type GetExerciseParams = OperationParams<"getExercise">;
export type GetExercisePayload = OperationPayload<"getExercise">;
export type GetExerciseResponse = OperationResponse<"getExercise">;

/** DELETE /workout/exercise/{id} — Delete exercise */
export type DeleteExerciseParams = OperationParams<"deleteExercise">;
export type DeleteExercisePayload = OperationPayload<"deleteExercise">;
export type DeleteExerciseResponse = OperationResponse<"deleteExercise">;

/** DELETE /workout/physicalassessment/{id} — Delete physical assessment */
export type DeletePhysicalAssessmentParams =
  OperationParams<"deletePhysicalAssessment">;
export type DeletePhysicalAssessmentPayload =
  OperationPayload<"deletePhysicalAssessment">;
export type DeletePhysicalAssessmentResponse =
  OperationResponse<"deletePhysicalAssessment">;

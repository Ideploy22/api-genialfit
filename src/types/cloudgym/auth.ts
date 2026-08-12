/**
 * Route types for the "auth" tag.
 * Auto-generated from cloudgym.json. Do not edit by hand.
 */
import type {
  OperationParams,
  OperationPayload,
  OperationResponse,
} from "./helpers";

/** POST /auth/token — Authenticate user and get JWT token */
export type CreateToken2Params = OperationParams<"createToken2">;
export type CreateToken2Payload = OperationPayload<"createToken2">;
export type CreateToken2Response = OperationResponse<"createToken2">;

/** POST /auth/password/reset — Reset user password */
export type ResetPasswordParams = OperationParams<"resetPassword">;
export type ResetPasswordPayload = OperationPayload<"resetPassword">;
export type ResetPasswordResponse = OperationResponse<"resetPassword">;

/** POST /auth/password/change — Change user password */
export type ChangePasswordParams = OperationParams<"changePassword">;
export type ChangePasswordPayload = OperationPayload<"changePassword">;
export type ChangePasswordResponse = OperationResponse<"changePassword">;

/** GET /auth/token_checkout — Authenticate user and get JWT token */
export type CreateTokenCheckoutParams = OperationParams<"createTokenCheckout">;
export type CreateTokenCheckoutPayload =
  OperationPayload<"createTokenCheckout">;
export type CreateTokenCheckoutResponse =
  OperationResponse<"createTokenCheckout">;

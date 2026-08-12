/**
 * Route types for the "Financial" tag.
 * Auto-generated from cloudgym.json. Do not edit by hand.
 */
import type {
  OperationParams,
  OperationPayload,
  OperationResponse,
} from "./helpers";

/** PUT /financial/account — Update Account */
export type UpdateAccountParams = OperationParams<"updateAccount">;
export type UpdateAccountPayload = OperationPayload<"updateAccount">;
export type UpdateAccountResponse = OperationResponse<"updateAccount">;

/** POST /financial/account — Create new account */
export type NewAccountParams = OperationParams<"newAccount">;
export type NewAccountPayload = OperationPayload<"newAccount">;
export type NewAccountResponse = OperationResponse<"newAccount">;

/** POST /financial/ignoreofaccount/{id} — Ignore OF Account */
export type IgnoreOFAccountParams = OperationParams<"ignoreOFAccount">;
export type IgnoreOFAccountPayload = OperationPayload<"ignoreOFAccount">;
export type IgnoreOFAccountResponse = OperationResponse<"ignoreOFAccount">;

/** GET /financial/memberPaymentsTax/{unitId}/{begin}/{end} — Get Member Payments for Tax */
export type GetMemberPaymentsTaxParams =
  OperationParams<"getMemberPaymentsTax">;
export type GetMemberPaymentsTaxPayload =
  OperationPayload<"getMemberPaymentsTax">;
export type GetMemberPaymentsTaxResponse =
  OperationResponse<"getMemberPaymentsTax">;

/** GET /financial/memberPayments/{unitId}/{begin}/{end} — Get Member Payments */
export type GetMemberPaymentsParams = OperationParams<"getMemberPayments">;
export type GetMemberPaymentsPayload = OperationPayload<"getMemberPayments">;
export type GetMemberPaymentsResponse = OperationResponse<"getMemberPayments">;

/** GET /financial/accounts/{unitId}/{bankId}/{begin}/{end} — Get all accounts */
export type GetAllAccountsParams = OperationParams<"getAllAccounts">;
export type GetAllAccountsPayload = OperationPayload<"getAllAccounts">;
export type GetAllAccountsResponse = OperationResponse<"getAllAccounts">;

/** GET /financial/account/{id} — Get Account by ID */
export type GetAccountByIdParams = OperationParams<"getAccountById">;
export type GetAccountByIdPayload = OperationPayload<"getAccountById">;
export type GetAccountByIdResponse = OperationResponse<"getAccountById">;

/** DELETE /financial/account/{id} — Delete Account */
export type DeleteAccountParams = OperationParams<"deleteAccount">;
export type DeleteAccountPayload = OperationPayload<"deleteAccount">;
export type DeleteAccountResponse = OperationResponse<"deleteAccount">;

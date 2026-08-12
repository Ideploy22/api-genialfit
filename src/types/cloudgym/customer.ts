/**
 * Route types for the "Customer" tag.
 * Auto-generated from cloudgym.json. Do not edit by hand.
 */
import type {
  OperationParams,
  OperationPayload,
  OperationResponse,
} from "./helpers";

/** PUT /customer/contract/{contractId} — Update contract */
export type UpdateContractParams = OperationParams<"updateContract">;
export type UpdateContractPayload = OperationPayload<"updateContract">;
export type UpdateContractResponse = OperationResponse<"updateContract">;

/** PUT /customer/contract/{contractId}/unfreeze — Unfreeze contract */
export type UnfreezeContractParams = OperationParams<"unfreezeContract">;
export type UnfreezeContractPayload = OperationPayload<"unfreezeContract">;
export type UnfreezeContractResponse = OperationResponse<"unfreezeContract">;

/** PUT /customer/contract/{contractId}/stopautorenew — Stop contract auto renew */
export type StopAutoRenewParams = OperationParams<"stopAutoRenew">;
export type StopAutoRenewPayload = OperationPayload<"stopAutoRenew">;
export type StopAutoRenewResponse = OperationResponse<"stopAutoRenew">;

/** PUT /customer/contract/{contractId}/migrate/{planId}/{changeDueDate}/{computeprorata} — Migrate contract */
export type MigrateContractParams = OperationParams<"migrateContract">;
export type MigrateContractPayload = OperationPayload<"migrateContract">;
export type MigrateContractResponse = OperationResponse<"migrateContract">;

/** PUT /customer/contract/{contractId}/freeze — Freeze contract */
export type FreezeContractParams = OperationParams<"freezeContract">;
export type FreezeContractPayload = OperationPayload<"freezeContract">;
export type FreezeContractResponse = OperationResponse<"freezeContract">;

/** PUT /customer/contract/{contractId}/extend/{days} — Add days to contract */
export type ExtendContractParams = OperationParams<"extendContract">;
export type ExtendContractPayload = OperationPayload<"extendContract">;
export type ExtendContractResponse = OperationResponse<"extendContract">;

/** PUT /customer/contract/{contractId}/changeduedate/{newDueDay} — Change contract due date */
export type ChangeContractDueDateParams =
  OperationParams<"changeContractDueDate">;
export type ChangeContractDueDatePayload =
  OperationPayload<"changeContractDueDate">;
export type ChangeContractDueDateResponse =
  OperationResponse<"changeContractDueDate">;

/** PUT /customer/contract/{contractId}/changebalance — Change contract credits */
export type UpdateContractBalanceParams =
  OperationParams<"updateContractBalance">;
export type UpdateContractBalancePayload =
  OperationPayload<"updateContractBalance">;
export type UpdateContractBalanceResponse =
  OperationResponse<"updateContractBalance">;

/** PUT /customer/contract/{contractId}/cancel/{cancelDate}/{reason} — Cancel contract */
export type CancelContractParams = OperationParams<"cancelContract">;
export type CancelContractPayload = OperationPayload<"cancelContract">;
export type CancelContractResponse = OperationResponse<"cancelContract">;

/** PUT /customer/contract/paymentmethod — Update contract payment method */
export type UpdateContractPaymentMethodParams =
  OperationParams<"updateContractPaymentMethod">;
export type UpdateContractPaymentMethodPayload =
  OperationPayload<"updateContractPaymentMethod">;
export type UpdateContractPaymentMethodResponse =
  OperationResponse<"updateContractPaymentMethod">;

/** POST /customer — Create new customer */
export type CreateMemberParams = OperationParams<"createMember">;
export type CreateMemberPayload = OperationPayload<"createMember">;
export type CreateMemberResponse = OperationResponse<"createMember">;

/** POST /customer/invoices/{id}/pay — Pay invoice */
export type PayInvoicesParams = OperationParams<"payInvoices">;
export type PayInvoicesPayload = OperationPayload<"payInvoices">;
export type PayInvoicesResponse = OperationResponse<"payInvoices">;

/** POST /customer/fromprospect — Create new member from prospect */
export type CreateMemberFromProspectParams =
  OperationParams<"createMemberFromProspect">;
export type CreateMemberFromProspectPayload =
  OperationPayload<"createMemberFromProspect">;
export type CreateMemberFromProspectResponse =
  OperationResponse<"createMemberFromProspect">;

/** POST /customer/contract — Create new contract */
export type CreateContractParams = OperationParams<"createContract">;
export type CreateContractPayload = OperationPayload<"createContract">;
export type CreateContractResponse = OperationResponse<"createContract">;

/** POST /customer/contract/{contractId}/addons — Add addOns to contract */
export type AddAddOnsToContractParams = OperationParams<"addAddOnsToContract">;
export type AddAddOnsToContractPayload =
  OperationPayload<"addAddOnsToContract">;
export type AddAddOnsToContractResponse =
  OperationResponse<"addAddOnsToContract">;

/** POST /customer/contract/addon/{contractAddOnId}/remove — Remove addOn from contract */
export type RemoveAddOnFromContractParams =
  OperationParams<"removeAddOnFromContract">;
export type RemoveAddOnFromContractPayload =
  OperationPayload<"removeAddOnFromContract">;
export type RemoveAddOnFromContractResponse =
  OperationResponse<"removeAddOnFromContract">;

/** POST /customer/confirmpayment/{tid} — Confirm payment */
export type ConfirmPaymentParams = OperationParams<"confirmPayment">;
export type ConfirmPaymentPayload = OperationPayload<"confirmPayment">;
export type ConfirmPaymentResponse = OperationResponse<"confirmPayment">;

/** GET /customer/classattendance/{memberId} — Get class attendance for member */
export type GetClassAttendanceParams = OperationParams<"getClassAttendance">;
export type GetClassAttendancePayload = OperationPayload<"getClassAttendance">;
export type GetClassAttendanceResponse =
  OperationResponse<"getClassAttendance">;

/** GET /customer/attendance/{memberId} — Get attendance for member */
export type GetAttendanceParams = OperationParams<"getAttendance">;
export type GetAttendancePayload = OperationPayload<"getAttendance">;
export type GetAttendanceResponse = OperationResponse<"getAttendance">;

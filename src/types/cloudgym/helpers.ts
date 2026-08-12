/**
 * Generic helpers to pull the path/query params, JSON request body, and JSON
 * response body out of a generated operation entry.
 * Auto-generated from cloudgym.json. Do not edit by hand.
 */
import type { operations } from "./schema";

export type OperationParams<Op extends keyof operations> =
  operations[Op] extends { parameters: { query?: infer Q; path?: infer P } }
    ? (Q extends undefined ? unknown : Q) & (P extends undefined ? unknown : P)
    : never;

export type OperationPayload<Op extends keyof operations> =
  operations[Op] extends {
    requestBody?: { content: { "application/json": infer B } };
  }
    ? B
    : never;

export type OperationResponse<
  Op extends keyof operations,
  Status extends number = 200,
> = operations[Op] extends { responses: infer R }
  ? Status extends keyof R
    ? R[Status] extends { content: infer C }
      ? C extends { "application/json": infer J }
        ? J
        : C extends { "*/*": infer A }
          ? A
          : never
      : never
    : never
  : never;

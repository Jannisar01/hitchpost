export * from "./a2a.ts";
export * from "./booking.ts";

export type Decision = "approved" | "declined";

/** Only an explicit human approval lets an offer go through (ADR 0007). */
export function canCommit(decision: Decision | undefined): boolean {
  return decision === "approved";
}

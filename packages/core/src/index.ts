// Walking skeleton (ADR 0009). Replaced by real protocol code in Phase 1.

export type Decision = "approved" | "declined";

/** Only an explicit human approval lets an offer go through (ADR 0007). */
export function canCommit(decision: Decision | undefined): boolean {
  return decision === "approved";
}

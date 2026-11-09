// The approval gate (ADR 0007, ADR 0013): the only place an Approval can come from.
// Nothing that commits a person happens without one, and an approval is bound to one offer.
import type { Offer } from "@hitchpost/core";

/** P-09: treat an offer as expired this long before its hold runs out, measured on my own clock. */
export const CLOCK_MARGIN_MS = 30_000;

const issued = new WeakSet<Approval>();

export class Approval {
  readonly offer: Offer;
  readonly decidedAt: number;
  /** Local deadline: when I received the offer plus the hold it promised, minus the margin. */
  readonly deadline: number;

  private constructor(offer: Offer, decidedAt: number, deadline: number) {
    this.offer = offer;
    this.decidedAt = decidedAt;
    this.deadline = deadline;
    issued.add(this);
  }

  /**
   * Record the person's yes to this exact offer. Called only from the place a human said yes.
   * Returns undefined if the hold has already run out by the person's clock.
   */
  static grant(offer: Offer, receivedAt: number, now: number = Date.now()): Approval | undefined {
    const hold = Date.parse(offer.expiresAt) - Date.parse(offer.issuedAt);
    const deadline = receivedAt + hold - CLOCK_MARGIN_MS;
    return now < deadline ? new Approval(offer, now, deadline) : undefined;
  }

  /** True only for approvals this gate created, so a look-alike object can't book anything. */
  static isGenuine(value: unknown): value is Approval {
    return value instanceof Approval && issued.has(value);
  }
}

// The structured messages two agents exchange to book an appointment.
// They travel as A2A data parts, never as free text, so nothing is parsed out of prose (ADR 0010).

export type AvailabilityRequest = {
  kind: "availability_request";
  service: string;
  /** ISO 8601 instants. The barber offers the first free slot that starts in this window. */
  earliest: string;
  latest: string;
};

export type Offer = {
  kind: "offer";
  offerId: string;
  service: string;
  start: string;
  durationMinutes: number;
  priceCents: number;
  currency: string;
  /** The business's clock is the authority (P-09): the slot is held from issuedAt until expiresAt (P-01). */
  issuedAt: string;
  expiresAt: string;
};

export type NoAvailability = { kind: "no_availability"; service: string };

export type Rejected = { kind: "rejected"; reason: string };

export type BarberReply = Offer | NoAvailability | Rejected;

/** Longest window one request may search. Also bounds the work one request can cause. */
export const MAX_WINDOW_DAYS = 31;
const MAX_DURATION_MINUTES = 24 * 60;
const MAX_PRICE_CENTS = 10_000_000;

// Strict ISO 8601 with an explicit zone. Date.parse alone accepts prose like "ignore this 2026".
// Hours 00-23 (no 24:00 rollover), minutes and seconds 00-59, offsets within the real range of -14:00 to +14:00.
const ISO_INSTANT =
  /^(\d{4})-(\d{2})-(\d{2})T([01]\d|2[0-3]):[0-5]\d(:[0-5]\d(\.\d{1,3})?)?(Z|[+-](0\d|1[0-3]):[0-5]\d|[+-]14:00)$/;
// Letters, digits, punctuation and spaces only: no newlines or terminal escape codes.
const SAFE_TEXT = /^[^\p{C}]{1,200}$/u;

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;
const isSafeText = (v: unknown): v is string => typeof v === "string" && SAFE_TEXT.test(v);
const isCount = (v: unknown, min: number, max: number): v is number =>
  Number.isSafeInteger(v) && (v as number) >= min && (v as number) <= max;

/** The instant as canonical UTC ("2026-11-12T17:00:00.000Z"), or undefined if not strict ISO. */
function toInstant(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const m = ISO_INSTANT.exec(v);
  if (!m) return undefined;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  // Reject days that don't exist (2026-02-30) instead of letting them roll over.
  if (new Date(Date.UTC(y, mo - 1, d)).getUTCDate() !== d) return undefined;
  const t = Date.parse(v);
  return Number.isNaN(t) ? undefined : new Date(t).toISOString();
}

// Inbound data comes from another agent: untrusted. Validate the shape, rebuild a clean object.
export function parseAvailabilityRequest(value: unknown): AvailabilityRequest | undefined {
  if (!isObject(value) || value.kind !== "availability_request") return undefined;
  const earliest = toInstant(value.earliest);
  const latest = toInstant(value.latest);
  if (!isSafeText(value.service) || !earliest || !latest) return undefined;
  const span = Date.parse(latest) - Date.parse(earliest);
  if (span <= 0 || span > MAX_WINDOW_DAYS * 86_400_000) return undefined;
  return { kind: "availability_request", service: value.service, earliest, latest };
}

export function parseBarberReply(value: unknown): BarberReply | undefined {
  if (!isObject(value)) return undefined;
  if (value.kind === "no_availability" && isSafeText(value.service)) {
    return { kind: "no_availability", service: value.service };
  }
  if (value.kind === "rejected" && isSafeText(value.reason)) {
    return { kind: "rejected", reason: value.reason };
  }
  const { offerId, service, durationMinutes, priceCents, currency } = value;
  const start = toInstant(value.start);
  const issuedAt = toInstant(value.issuedAt);
  const expiresAt = toInstant(value.expiresAt);
  if (
    value.kind === "offer" &&
    isSafeText(offerId) &&
    isSafeText(service) &&
    start &&
    issuedAt &&
    expiresAt &&
    Date.parse(issuedAt) < Date.parse(expiresAt) &&
    isCount(durationMinutes, 1, MAX_DURATION_MINUTES) &&
    isCount(priceCents, 0, MAX_PRICE_CENTS) &&
    typeof currency === "string" &&
    /^[A-Z]{3}$/.test(currency)
  ) {
    return {
      kind: "offer",
      offerId,
      service,
      start,
      durationMinutes,
      priceCents,
      currency,
      issuedAt,
      expiresAt,
    };
  }
  return undefined;
}

// Committing to an offer (ADR 0012): questions are Messages, commitments are Tasks.

export type BookingRequest = { kind: "booking_request"; offerId: string };

export type BookingConfirmed = {
  kind: "booking_confirmed";
  bookingId: string;
  offerId: string;
  service: string;
  start: string;
  durationMinutes: number;
  priceCents: number;
  currency: string;
  /** Presented later to cancel or reschedule. A bearer secret: see ADR 0021. */
  bookingToken: string;
  /** Set when this answers a resend of a booking_request that was already confirmed. */
  duplicateOf?: string;
};

export const BOOKING_REJECT_REASONS = ["expired", "unknown_offer", "slot_taken", "other"] as const;
export type BookingRejected = {
  kind: "booking_rejected";
  offerId: string;
  reason: (typeof BOOKING_REJECT_REASONS)[number];
};

export type BookingReply = BookingConfirmed | BookingRejected;

export function parseBookingRequest(value: unknown): BookingRequest | undefined {
  if (!isObject(value) || value.kind !== "booking_request" || !isSafeText(value.offerId))
    return undefined;
  return { kind: "booking_request", offerId: value.offerId };
}

export function parseBookingReply(value: unknown): BookingReply | undefined {
  if (!isObject(value)) return undefined;
  if (
    value.kind === "booking_rejected" &&
    isSafeText(value.offerId) &&
    BOOKING_REJECT_REASONS.includes(value.reason as BookingRejected["reason"])
  ) {
    return {
      kind: "booking_rejected",
      offerId: value.offerId,
      reason: value.reason as BookingRejected["reason"],
    };
  }
  const start = toInstant(value.start);
  const {
    bookingId,
    offerId,
    service,
    durationMinutes,
    priceCents,
    currency,
    bookingToken,
    duplicateOf,
  } = value;
  if (
    value.kind === "booking_confirmed" &&
    isSafeText(bookingId) &&
    isSafeText(offerId) &&
    isSafeText(service) &&
    start &&
    isCount(durationMinutes, 1, MAX_DURATION_MINUTES) &&
    isCount(priceCents, 0, MAX_PRICE_CENTS) &&
    typeof currency === "string" &&
    /^[A-Z]{3}$/.test(currency) &&
    isSafeText(bookingToken) &&
    (duplicateOf === undefined || isSafeText(duplicateOf))
  ) {
    return {
      kind: "booking_confirmed",
      bookingId,
      offerId,
      service,
      start,
      durationMinutes,
      priceCents,
      currency,
      bookingToken,
      ...(duplicateOf === undefined ? {} : { duplicateOf }),
    };
  }
  return undefined;
}

/** A confirmation must restate the approved offer field for field before anyone writes it to a calendar. */
export function confirmationMatches(offer: Offer, confirmed: BookingConfirmed): boolean {
  return (
    confirmed.offerId === offer.offerId &&
    confirmed.service === offer.service &&
    confirmed.start === offer.start &&
    confirmed.durationMinutes === offer.durationMinutes &&
    confirmed.priceCents === offer.priceCents &&
    confirmed.currency === offer.currency
  );
}

/** A well formed offer can still answer a different question. Check it answers ours. */
export function offerMatches(request: AvailabilityRequest, offer: Offer): boolean {
  const start = Date.parse(offer.start);
  return (
    offer.service === request.service &&
    start >= Date.parse(request.earliest) &&
    start <= Date.parse(request.latest)
  );
}

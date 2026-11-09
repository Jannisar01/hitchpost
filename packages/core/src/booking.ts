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
};

export type NoAvailability = { kind: "no_availability"; service: string };

export type Rejected = { kind: "rejected"; reason: string };

export type BarberReply = Offer | NoAvailability | Rejected;

/** Longest window one request may search. Also bounds the work one request can cause. */
export const MAX_WINDOW_DAYS = 31;
const MAX_DURATION_MINUTES = 24 * 60;
const MAX_PRICE_CENTS = 10_000_000;

// Strict ISO 8601 with an explicit zone. Date.parse alone accepts prose like "ignore this 2026".
const ISO_INSTANT = /^(\d{4})-(\d{2})-(\d{2})T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/;
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
  if (
    value.kind === "offer" &&
    isSafeText(offerId) &&
    isSafeText(service) &&
    start &&
    isCount(durationMinutes, 1, MAX_DURATION_MINUTES) &&
    isCount(priceCents, 0, MAX_PRICE_CENTS) &&
    typeof currency === "string" &&
    /^[A-Z]{3}$/.test(currency)
  ) {
    return { kind: "offer", offerId, service, start, durationMinutes, priceCents, currency };
  }
  return undefined;
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

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

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;
const isInstant = (v: unknown): v is string =>
  typeof v === "string" && !Number.isNaN(Date.parse(v));
const isShortText = (v: unknown): v is string =>
  typeof v === "string" && v.length > 0 && v.length <= 200;

// Inbound data comes from another agent: untrusted. Validate the shape, rebuild a clean object.
export function parseAvailabilityRequest(value: unknown): AvailabilityRequest | undefined {
  if (!isObject(value) || value.kind !== "availability_request") return undefined;
  const { service, earliest, latest } = value;
  if (!isShortText(service) || !isInstant(earliest) || !isInstant(latest)) return undefined;
  if (Date.parse(earliest) >= Date.parse(latest)) return undefined;
  return { kind: "availability_request", service, earliest, latest };
}

export function parseBarberReply(value: unknown): BarberReply | undefined {
  if (!isObject(value)) return undefined;
  if (value.kind === "no_availability" && isShortText(value.service)) {
    return { kind: "no_availability", service: value.service };
  }
  if (value.kind === "rejected" && isShortText(value.reason)) {
    return { kind: "rejected", reason: value.reason };
  }
  const { offerId, service, start, durationMinutes, priceCents, currency } = value;
  if (
    value.kind === "offer" &&
    isShortText(offerId) &&
    isShortText(service) &&
    isInstant(start) &&
    Number.isInteger(durationMinutes) &&
    (durationMinutes as number) > 0 &&
    Number.isInteger(priceCents) &&
    (priceCents as number) >= 0 &&
    typeof currency === "string" &&
    /^[A-Z]{3}$/.test(currency)
  ) {
    return {
      kind: "offer",
      offerId,
      service,
      start,
      durationMinutes: durationMinutes as number,
      priceCents: priceCents as number,
      currency,
    };
  }
  return undefined;
}

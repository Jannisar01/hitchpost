// The barber's appointment book: the tool the barber agent looks things up in.
// shortcut: in memory and UTC only; swap for the barber's real booking system over MCP in a later phase.

export type Service = { name: string; durationMinutes: number; priceCents: number };

export type Booking = { start: string; durationMinutes: number };

export type Book = {
  currency: string;
  services: Service[];
  /** Opening hours per UTC day of week (0 = Sunday), as [openHour, closeHour). */
  hours: Partial<Record<number, [number, number]>>;
  booked: Booking[];
};

const SLOT_MINUTES = 30;
const MINUTE = 60_000;

/**
 * First free slot for a service that starts within [earliest, latest] and not before now.
 * The window must already be validated and bounded (parseAvailabilityRequest caps it).
 */
export function findFreeSlot(
  book: Book,
  serviceName: string,
  earliest: string,
  latest: string,
  now: number = Date.now(),
): { service: Service; start: string } | undefined {
  const service = book.services.find((s) => s.name === serviceName);
  if (!service) return undefined;

  const length = service.durationMinutes * MINUTE;
  const taken = book.booked.map((b) => {
    const from = Date.parse(b.start);
    return [from, from + b.durationMinutes * MINUTE] as const;
  });
  const overlaps = (t: number) => taken.some(([from, to]) => t < to && from < t + length);

  const step = SLOT_MINUTES * MINUTE;
  const end = Date.parse(latest);
  // Round up to the next slot boundary, never earlier than now.
  let t = Math.ceil(Math.max(Date.parse(earliest), now) / step) * step;

  for (; t <= end; t += step) {
    const day = new Date(t);
    const open = book.hours[day.getUTCDay()];
    if (!open) continue;
    const minutes = day.getUTCHours() * 60 + day.getUTCMinutes();
    const fits = minutes >= open[0] * 60 && minutes + service.durationMinutes <= open[1] * 60;
    if (fits && !overlaps(t)) return { service, start: day.toISOString() };
  }
  return undefined;
}

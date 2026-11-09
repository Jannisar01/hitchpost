// The barber's appointment book: the tool the barber agent looks things up in.
// shortcut: in memory and UTC only; swap for the barber's real booking system over MCP in a later phase.

export type Service = { name: string; durationMinutes: number; priceCents: number };

export type Book = {
  currency: string;
  services: Service[];
  /** Opening hours per UTC day of week (0 = Sunday), as [openHour, closeHour). */
  hours: Partial<Record<number, [number, number]>>;
  /** Start instants (ISO) of slots already taken. */
  booked: string[];
};

const SLOT_MINUTES = 30;
const MINUTE = 60_000;

/** First free slot for a service that starts within [earliest, latest], or undefined. */
export function findFreeSlot(
  book: Book,
  serviceName: string,
  earliest: string,
  latest: string,
): { service: Service; start: string } | undefined {
  const service = book.services.find((s) => s.name === serviceName);
  if (!service) return undefined;

  const taken = new Set(book.booked.map((iso) => Date.parse(iso)));
  const end = Date.parse(latest);
  const step = SLOT_MINUTES * MINUTE;
  // Round up to the next slot boundary.
  let t = Math.ceil(Date.parse(earliest) / step) * step;

  for (; t <= end; t += step) {
    const day = new Date(t);
    const open = book.hours[day.getUTCDay()];
    if (!open) continue;
    const minutes = day.getUTCHours() * 60 + day.getUTCMinutes();
    const fits = minutes >= open[0] * 60 && minutes + service.durationMinutes <= open[1] * 60;
    if (fits && !taken.has(t)) return { service, start: new Date(t).toISOString() };
  }
  return undefined;
}

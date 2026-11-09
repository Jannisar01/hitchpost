import { createHmac, randomBytes } from "node:crypto";
import { type Message, Role, TaskState } from "@a2a-js/sdk";
import {
  AgentEvent,
  type AgentExecutor,
  type ExecutionEventBus,
  type RequestContext,
} from "@a2a-js/sdk/server";
import {
  type BarberReply,
  type BookingReply,
  dataPart,
  firstData,
  type Offer,
  parseAvailabilityRequest,
  parseBookingRequest,
} from "@hitchpost/core";
import { type Book, type Booking, findFreeSlot } from "./book.ts";

/** P-01: how long an offer holds its slot. */
export const OFFER_HOLD_MS = 10 * 60_000;
/** P-31: open holds per business, whoever asks, so rotating client keys can't exhaust the chairs. */
export const MAX_OPEN_HOLDS = 10;

type OfferRecord = {
  offer: Offer;
  state: "held" | "booked";
  /** The Task that booked it, and its answer, so a resend gets the same answer (no second booking). */
  taskId?: string;
  confirmation?: Extract<BookingReply, { kind: "booking_confirmed" }>;
};

/**
 * Answers availability with a held offer (a Message) and books a held offer (a Task, ADR 0012).
 * Standing approval: opening hours are the business's yes, so a valid booking_request books at once.
 * The person's yes is enforced on their side by the approval gate (ADR 0007).
 */
export class BarberExecutor implements AgentExecutor {
  readonly book: Book;
  readonly now: () => number;
  readonly offers = new Map<string, OfferRecord>();
  readonly #tokenKey: Buffer;

  constructor(book: Book, now: () => number = Date.now, tokenKey: Buffer = randomBytes(32)) {
    this.book = book;
    this.now = now;
    this.#tokenKey = tokenKey;
  }

  async execute(ctx: RequestContext, bus: ExecutionEventBus): Promise<void> {
    const input = firstData(ctx.userMessage);
    const booking = parseBookingRequest(input);
    if (booking) return this.#bookAsTask(ctx, bus, booking.offerId);
    bus.publish(AgentEvent.message(this.#message(ctx, this.reply(input), "")));
  }

  reply(input: unknown): BarberReply {
    const request = parseAvailabilityRequest(input);
    if (!request) return { kind: "rejected", reason: "expected a valid availability_request" };

    const now = this.now();
    const holds = this.#openHolds(now);
    if (holds.length >= MAX_OPEN_HOLDS) return { kind: "rejected", reason: "hold_cap" };

    // Open holds count as taken, so two people are never offered the same chair.
    const slot = findFreeSlot(
      { ...this.book, booked: [...this.book.booked, ...holds] },
      request.service,
      request.earliest,
      request.latest,
      now,
    );
    if (!slot) return { kind: "no_availability", service: request.service };

    const offer: Offer = {
      kind: "offer",
      offerId: crypto.randomUUID(),
      service: slot.service.name,
      start: slot.start,
      durationMinutes: slot.service.durationMinutes,
      priceCents: slot.service.priceCents,
      currency: this.book.currency,
      issuedAt: new Date(now).toISOString(),
      expiresAt: new Date(now + OFFER_HOLD_MS).toISOString(),
    };
    this.offers.set(offer.offerId, { offer, state: "held" });
    return offer;
  }

  /** Check and write in one synchronous step: no await between them, so no other request interleaves. */
  commit(offerId: string, taskId: string): BookingReply {
    const record = this.offers.get(offerId);
    if (!record) return { kind: "booking_rejected", offerId, reason: "unknown_offer" };
    if (record.state === "booked" && record.confirmation) {
      return { ...record.confirmation, duplicateOf: record.taskId };
    }
    const { offer } = record;
    if (this.now() >= Date.parse(offer.expiresAt)) {
      return { kind: "booking_rejected", offerId, reason: "expired" };
    }
    const start = Date.parse(offer.start);
    const end = start + offer.durationMinutes * 60_000;
    const clash = this.book.booked.some((b) => {
      const from = Date.parse(b.start);
      return from < end && start < from + b.durationMinutes * 60_000;
    });
    if (clash) return { kind: "booking_rejected", offerId, reason: "slot_taken" };

    this.book.booked.push({ start: offer.start, durationMinutes: offer.durationMinutes });
    const bookingId = crypto.randomUUID();
    const confirmation = {
      kind: "booking_confirmed" as const,
      bookingId,
      offerId,
      service: offer.service,
      start: offer.start,
      durationMinutes: offer.durationMinutes,
      priceCents: offer.priceCents,
      currency: offer.currency,
      // Derived, not stored: the same booking always yields the same token (ADR 0021).
      bookingToken: createHmac("sha256", this.#tokenKey).update(bookingId).digest("base64url"),
    };
    this.offers.set(offerId, { offer, state: "booked", taskId, confirmation });
    return confirmation;
  }

  async cancelTask(): Promise<void> {}

  #openHolds(now: number): Booking[] {
    const holds: Booking[] = [];
    for (const { offer, state } of this.offers.values()) {
      if (state === "held" && now < Date.parse(offer.expiresAt)) {
        holds.push({ start: offer.start, durationMinutes: offer.durationMinutes });
      }
    }
    return holds;
  }

  #bookAsTask(ctx: RequestContext, bus: ExecutionEventBus, offerId: string): void {
    bus.publish(
      AgentEvent.task({
        id: ctx.taskId,
        contextId: ctx.contextId,
        status: {
          state: TaskState.TASK_STATE_WORKING,
          message: undefined,
          timestamp: new Date().toISOString(),
        },
        artifacts: [],
        history: [ctx.userMessage],
        metadata: {},
      }),
    );
    const answer = this.commit(offerId, ctx.taskId);
    bus.publish(
      AgentEvent.statusUpdate({
        taskId: ctx.taskId,
        contextId: ctx.contextId,
        status: {
          state:
            answer.kind === "booking_confirmed"
              ? TaskState.TASK_STATE_COMPLETED
              : TaskState.TASK_STATE_REJECTED,
          message: this.#message(ctx, answer, ctx.taskId),
          timestamp: new Date().toISOString(),
        },
        metadata: {},
      }),
    );
  }

  #message(ctx: RequestContext, value: unknown, taskId: string): Message {
    return {
      role: Role.ROLE_AGENT,
      messageId: crypto.randomUUID(),
      contextId: ctx.contextId,
      taskId,
      parts: [dataPart(value)],
      extensions: [],
      metadata: {},
      referenceTaskIds: [],
    };
  }
}

import { Role } from "@a2a-js/sdk";
import {
  AgentEvent,
  type AgentExecutor,
  type ExecutionEventBus,
  type RequestContext,
} from "@a2a-js/sdk/server";
import { type BarberReply, dataPart, firstData, parseAvailabilityRequest } from "@hitchpost/core";
import { type Book, findFreeSlot } from "./book.ts";

/** Answers availability requests with an offer. It never books: booking needs a human yes (ADR 0007). */
export class BarberExecutor implements AgentExecutor {
  readonly book: Book;
  readonly now: () => number;

  constructor(book: Book, now: () => number = Date.now) {
    this.book = book;
    this.now = now;
  }

  async execute(ctx: RequestContext, bus: ExecutionEventBus): Promise<void> {
    // One reply message per request. The SDK's request handler closes the bus after we return.
    bus.publish(
      AgentEvent.message({
        role: Role.ROLE_AGENT,
        messageId: crypto.randomUUID(),
        contextId: ctx.contextId,
        taskId: "",
        parts: [dataPart(this.reply(firstData(ctx.userMessage)))],
        extensions: [],
        metadata: {},
        referenceTaskIds: [],
      }),
    );
  }

  reply(input: unknown): BarberReply {
    const request = parseAvailabilityRequest(input);
    if (!request) return { kind: "rejected", reason: "expected a valid availability_request" };

    const slot = findFreeSlot(
      this.book,
      request.service,
      request.earliest,
      request.latest,
      this.now(),
    );
    if (!slot) return { kind: "no_availability", service: request.service };

    return {
      kind: "offer",
      offerId: crypto.randomUUID(),
      service: slot.service.name,
      start: slot.start,
      durationMinutes: slot.service.durationMinutes,
      priceCents: slot.service.priceCents,
      currency: this.book.currency,
    };
  }

  // Replies are single messages, so there is never a running task to cancel.
  async cancelTask(): Promise<void> {}
}

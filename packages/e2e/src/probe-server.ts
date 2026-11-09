// A minimal A2A server for pinning down SDK behaviour. Not product code.
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import {
  A2A_PROTOCOL_VERSION,
  AGENT_CARD_PATH,
  type AgentCard,
  type AgentExtension,
  Role,
  type Task,
  TaskState,
} from "@a2a-js/sdk";
import {
  AgentEvent,
  type AgentExecutor,
  DefaultRequestHandler,
  type ExecutionEventBus,
  InMemoryTaskStore,
  type RequestContext,
} from "@a2a-js/sdk/server";
import { agentCardHandler, jsonRpcHandler, UserBuilder } from "@a2a-js/sdk/server/express";
import { dataPart, firstData } from "@hitchpost/core";
import express from "express";

export const SECRET = "s3cr3t-booking-token";

const agentMessage = (ctx: RequestContext, value: unknown) => ({
  role: Role.ROLE_AGENT,
  messageId: crypto.randomUUID(),
  contextId: ctx.contextId,
  taskId: ctx.taskId,
  parts: [dataPart(value)],
  extensions: [],
  metadata: {},
  referenceTaskIds: [],
});

/** "complete": finish the Task at once with a secret in the final message. "park": leave it WORKING. */
export class ProbeExecutor implements AgentExecutor {
  async execute(ctx: RequestContext, bus: ExecutionEventBus): Promise<void> {
    const mode = (firstData(ctx.userMessage) as { mode?: string } | undefined)?.mode;
    const task: Task = {
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
    };
    bus.publish(AgentEvent.task(task));
    if (mode === "park") return;
    bus.publish(
      AgentEvent.statusUpdate({
        taskId: ctx.taskId,
        contextId: ctx.contextId,
        status: {
          state: TaskState.TASK_STATE_COMPLETED,
          message: agentMessage(ctx, { kind: "booking_confirmed", bookingToken: SECRET }),
          timestamp: new Date().toISOString(),
        },
        metadata: {},
      }),
    );
  }

  async cancelTask(): Promise<void> {}
}

export async function startProbe(
  options: {
    handler?: (card: AgentCard, store: InMemoryTaskStore) => DefaultRequestHandler;
    extensions?: AgentExtension[];
  } = {},
) {
  const server = createServer();
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const card: AgentCard = {
    name: "Probe",
    description: "SDK behaviour probe",
    supportedInterfaces: [
      {
        url: `${url}/`,
        protocolBinding: "JSONRPC",
        tenant: "",
        protocolVersion: A2A_PROTOCOL_VERSION,
      },
    ],
    provider: undefined,
    version: "0.0.0",
    capabilities: {
      streaming: false,
      pushNotifications: false,
      extensions: options.extensions ?? [],
    },
    securitySchemes: {},
    securityRequirements: [],
    defaultInputModes: ["application/json"],
    defaultOutputModes: ["application/json"],
    skills: [],
    documentationUrl: "",
    signatures: [],
  };
  const store = new InMemoryTaskStore();
  const handler =
    options.handler?.(card, store) ?? new DefaultRequestHandler(card, store, new ProbeExecutor());
  const app = express();
  app.use(`/${AGENT_CARD_PATH}`, agentCardHandler({ agentCardProvider: handler }));
  app.use(jsonRpcHandler({ requestHandler: handler, userBuilder: UserBuilder.noAuthentication }));
  server.on("request", app);
  return { url, store, close: () => new Promise<void>((resolve) => server.close(() => resolve())) };
}

import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { A2A_PROTOCOL_VERSION, AGENT_CARD_PATH, type AgentCard } from "@a2a-js/sdk";
import { DefaultRequestHandler, InMemoryTaskStore } from "@a2a-js/sdk/server";
import { agentCardHandler, jsonRpcHandler, UserBuilder } from "@a2a-js/sdk/server/express";
import express from "express";
import type { Book } from "./book.ts";
import { BarberExecutor } from "./executor.ts";

export function barberCard(name: string, url: string): AgentCard {
  return {
    name,
    description: "Books appointments at this barbershop. Offers slots; a human confirms.",
    supportedInterfaces: [
      { url, protocolBinding: "JSONRPC", tenant: "", protocolVersion: A2A_PROTOCOL_VERSION },
    ],
    provider: undefined,
    version: "0.1.0",
    capabilities: { streaming: false, pushNotifications: false, extensions: [] },
    securitySchemes: {},
    securityRequirements: [],
    defaultInputModes: ["application/json"],
    defaultOutputModes: ["application/json"],
    skills: [
      {
        id: "offer_appointment",
        name: "Offer an appointment",
        description:
          "Send an availability_request data part; get back an offer, no_availability or rejected.",
        tags: ["booking", "barber"],
        examples: [],
        inputModes: ["application/json"],
        outputModes: ["application/json"],
        securityRequirements: [],
      },
    ],
    documentationUrl: "",
    signatures: [],
  };
}

/** Start a barber agent. Port 0 picks a free port. */
export async function startBarberAgent(name: string, book: Book, port = 0) {
  const server = createServer();
  await new Promise<void>((resolve) => server.listen(port, "127.0.0.1", resolve));
  const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

  const handler = new DefaultRequestHandler(
    barberCard(name, `${url}/`),
    new InMemoryTaskStore(),
    new BarberExecutor(book),
  );
  const app = express();
  app.use(`/${AGENT_CARD_PATH}`, agentCardHandler({ agentCardProvider: handler }));
  app.use(jsonRpcHandler({ requestHandler: handler, userBuilder: UserBuilder.noAuthentication }));
  server.on("request", app);

  return {
    url,
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
  };
}

import type { Message, Part } from "@a2a-js/sdk";

/** Wrap a JSON value as an A2A data part. */
export function dataPart(value: unknown): Part {
  return {
    content: { $case: "data", value },
    metadata: undefined,
    filename: "",
    mediaType: "application/json",
  };
}

/** The first data part of a message, or undefined. */
export function firstData(message: Message | undefined): unknown {
  const part = message?.parts.find((p) => p.content?.$case === "data");
  return part?.content?.$case === "data" ? part.content.value : undefined;
}

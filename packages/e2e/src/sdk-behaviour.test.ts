// Facts about @a2a-js/sdk 1.3 that the Hitchpost design depends on (docs/sad, ADR 0012).
// If an SDK upgrade changes any of these, this file fails first: it is the upgrade regression suite.
import assert from "node:assert/strict";
import { test } from "node:test";
import { Role, type Task, TaskState } from "@a2a-js/sdk";
import { type Client, ClientFactory } from "@a2a-js/sdk/client";
import { UnsupportedOperationError } from "@a2a-js/sdk/errors";
import { DefaultRequestHandler, type ServerCallContext } from "@a2a-js/sdk/server";
import { dataPart } from "@hitchpost/core";
import { ProbeExecutor, SECRET, startProbe } from "./probe-server.ts";

const send = (client: Client, value: unknown, taskId = "", options = {}) =>
  client.sendMessage(
    {
      tenant: "",
      message: {
        role: Role.ROLE_USER,
        messageId: crypto.randomUUID(),
        contextId: "",
        taskId,
        parts: [dataPart(value)],
        extensions: [],
        metadata: {},
        referenceTaskIds: [],
      },
      configuration: undefined,
      metadata: undefined,
    },
    options,
  );

const list = (client: Client) =>
  client.listTasks({
    tenant: "",
    contextId: "",
    status: TaskState.TASK_STATE_UNSPECIFIED,
    pageToken: "",
    statusTimestampAfter: undefined,
  });

test("F1: anything in a completed task's final message is stored and readable by GetTask", async () => {
  const probe = await startProbe();
  try {
    const result = (await send(await new ClientFactory().createFromUrl(probe.url), {
      mode: "complete",
    })) as Task;
    assert.equal(result.status?.state, TaskState.TASK_STATE_COMPLETED);
    const stranger = await new ClientFactory().createFromUrl(probe.url);
    const fetched = await stranger.getTask({ tenant: "", id: result.id, historyLength: undefined });
    assert.ok(JSON.stringify(fetched).includes(SECRET), "the secret is in the stored task");
  } finally {
    await probe.close();
  }
});

test("F2: ListTasks under noAuthentication hands every caller everyone's tasks", async () => {
  const probe = await startProbe();
  try {
    const owner = await new ClientFactory().createFromUrl(probe.url);
    const done = (await send(owner, { mode: "complete" })) as Task;
    const stranger = await new ClientFactory().createFromUrl(probe.url);
    const listed = await list(stranger);
    assert.ok(listed.tasks.some((t) => t.id === done.id));
    assert.ok(
      JSON.stringify(listed).includes(SECRET),
      "a stranger reads the secret through ListTasks",
    );
  } finally {
    await probe.close();
  }
});

test("F3: a send naming a completed task's id is refused", async () => {
  const probe = await startProbe();
  try {
    const client = await new ClientFactory().createFromUrl(probe.url);
    const done = (await send(client, { mode: "complete" })) as Task;
    await assert.rejects(send(client, { mode: "complete" }, done.id), /terminal state/);
  } finally {
    await probe.close();
  }
});

test("F4: a resend without a taskId creates a new task, so the SDK does not de-duplicate", async () => {
  const probe = await startProbe();
  try {
    const client = await new ClientFactory().createFromUrl(probe.url);
    const a = (await send(client, { mode: "complete" })) as Task;
    const b = (await send(client, { mode: "complete" })) as Task;
    assert.notEqual(a.id, b.id);
  } finally {
    await probe.close();
  }
});

test("F5: a required extension is refused without the A2A-Extensions header and accepted with it", async () => {
  const uri = "https://hitchpost.dev/ext/contract/v1";
  const probe = await startProbe({
    extensions: [{ uri, description: "", required: true, params: {} }],
  });
  try {
    const client = await new ClientFactory().createFromUrl(probe.url);
    await assert.rejects(send(client, { mode: "complete" }), /required extensions/i);
    const ok = (await send(client, { mode: "complete" }, "", {
      serviceParameters: { "A2A-Extensions": uri },
    })) as Task;
    assert.equal(ok.status?.state, TaskState.TASK_STATE_COMPLETED);
  } finally {
    await probe.close();
  }
});

test("F6: a request handler subclass can refuse ListTasks while sending still works", async () => {
  class MethodPolicy extends DefaultRequestHandler {
    override async listTasks(): Promise<never> {
      throw new UnsupportedOperationError("ListTasks is not offered");
    }
  }
  const probe = await startProbe({
    handler: (card, store) => new MethodPolicy(card, store, new ProbeExecutor()),
  });
  try {
    const client = await new ClientFactory().createFromUrl(probe.url);
    const done = (await send(client, { mode: "complete" })) as Task;
    assert.equal(done.status?.state, TaskState.TASK_STATE_COMPLETED);
    await assert.rejects(list(client), /not offered/);
  } finally {
    await probe.close();
  }
});

test("F7: a task left WORKING can be finished later by writing to the task store", async () => {
  const probe = await startProbe();
  try {
    const client = await new ClientFactory().createFromUrl(probe.url);
    const parked = (await send(client, { mode: "park" })) as Task;
    assert.equal(parked.status?.state, TaskState.TASK_STATE_WORKING);

    // The resolver: no executor running, just the store.
    const ctx = {} as ServerCallContext;
    const stored = await probe.store.load(parked.id, ctx);
    assert.ok(stored);
    await probe.store.save(
      {
        ...stored,
        status: {
          state: TaskState.TASK_STATE_COMPLETED,
          message: undefined,
          timestamp: new Date().toISOString(),
        },
      },
      ctx,
    );
    const later = await client.getTask({ tenant: "", id: parked.id, historyLength: undefined });
    assert.equal(later.status?.state, TaskState.TASK_STATE_COMPLETED);
  } finally {
    await probe.close();
  }
});

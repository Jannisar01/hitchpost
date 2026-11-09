import assert from "node:assert/strict";
import { test } from "node:test";
import { canCommit } from "./index.ts";

test("only an explicit approval can commit", () => {
  assert.equal(canCommit("approved"), true);
  assert.equal(canCommit("declined"), false);
  assert.equal(canCommit(undefined), false);
});

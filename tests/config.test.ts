import assert from "node:assert/strict";
import { test } from "node:test";
import { APP_NAME } from "../src/constants/config";
test("APP_NAME is 目標カレンダー", () => {
  assert.equal(APP_NAME, "目標カレンダー");
});

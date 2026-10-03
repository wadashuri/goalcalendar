import assert from "node:assert/strict";
import { test } from "node:test";
import { highlightSegments } from "../src/features/habit/model";

test("highlightSegments: 空クエリは全体を非ハイライトで返す", () => {
  assert.deepEqual(highlightSegments("今日は調子がいい", ""), [
    { text: "今日は調子がいい", highlighted: false },
  ]);
  assert.deepEqual(highlightSegments("今日は調子がいい", "   "), [
    { text: "今日は調子がいい", highlighted: false },
  ]);
});

test("highlightSegments: マッチなしは全体を非ハイライトで返す", () => {
  assert.deepEqual(highlightSegments("今日は調子がいい", "走る"), [
    { text: "今日は調子がいい", highlighted: false },
  ]);
});

test("highlightSegments: 大文字小文字を区別しない部分一致", () => {
  assert.deepEqual(highlightSegments("Morning Run", "run"), [
    { text: "Morning ", highlighted: false },
    { text: "Run", highlighted: true },
  ]);
});

test("highlightSegments: 複数マッチを重複なく分割する", () => {
  assert.deepEqual(highlightSegments("ランランラン", "ラン"), [
    { text: "ラン", highlighted: true },
    { text: "ラン", highlighted: true },
    { text: "ラン", highlighted: true },
  ]);
});

test("highlightSegments: 先頭・中間・末尾のマッチを正しく分割する", () => {
  assert.deepEqual(highlightSegments("走る、歩く、走る", "走る"), [
    { text: "走る", highlighted: true },
    { text: "、歩く、", highlighted: false },
    { text: "走る", highlighted: true },
  ]);
});

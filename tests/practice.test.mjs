import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import test from "node:test";

const source = await readFile(new URL("../web/app.js", import.meta.url), "utf8");
const start = source.indexOf("function selectTodayPractice(");
const end = source.indexOf("\nfunction generateTodayPractice(", start);
const context = vm.createContext({});
vm.runInContext(source.slice(start, end), context);
const candidate = (title, extra = {}) => ({ title, key: `4|${title}|SC`, score: 98, floorIndex: 30, days: 10, deficit: 1, canEnter: false, lpGap: 5, cooldown: 1, ...extra });

test("ten-song practice splits into warmup, challenge and finish without duplicate songs", () => {
  const rows = Array.from({ length: 15 }, (_, index) => candidate(index));
  rows.push({ ...rows[0], key: "6|0|SC" });
  const selected = context.selectTodayPractice(rows, 10);
  assert.equal(selected.length, 10);
  assert.equal(new Set(selected.map((item) => item.title)).size, 10);
  assert.equal(selected.filter((item) => item.role === "몸풀기").length, 2);
  assert.equal(selected.filter((item) => item.role === "갱신 도전").length, 6);
  assert.equal(selected.filter((item) => item.role === "마무리").length, 2);
  assert.ok(selected.every((item) => item.reason));
});

test("recent attempts lose priority and replacing keeps the requested role", () => {
  const selected = context.selectTodayPractice([candidate(1), candidate(2, { cooldown: 0.15 })], 1, "갱신 도전");
  assert.equal(selected[0].title, 1);
  assert.equal(selected[0].role, "갱신 도전");
});

test("short pools return available unique songs", () => {
  assert.equal(context.selectTodayPractice([candidate(1), candidate(1)], 10).length, 1);
});

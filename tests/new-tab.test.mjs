import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import test from "node:test";

const source = await readFile(new URL("../web/app.js", import.meta.url), "utf8");
const context = vm.createContext({});
vm.runInContext(source.slice(0, source.indexOf("const columns =")), context);
for (const name of ["normalizeDjPowerSongName", "parseDjPowerDate", "addSixMonths", "djPowerDlcGroup", "buildDjPowerHistoryMetadata", "shouldRetryDjPowerReleaseLookup", "latestDjPowerUpdateAt", "isDjPowerNewAt"]) {
  const start = source.indexOf(`function ${name}(`);
  const next = /^\s*(?:async )?function /gm;
  next.lastIndex = start + 1;
  const end = next.exec(source)?.index ?? source.length;
  vm.runInContext(source.slice(start, end), context);
}

test("title 829 uses its individual release instead of the PLI2 release", () => {
  const result = context.buildDjPowerHistoryMetadata([{ title: 829, name: "Permutation Part.1", dlcCode: "PLI2" }], [{ dlcCode: "PLI2", ymdt: "2025-08-14T00:00:00Z" }]);
  assert.equal(result.releaseAtByTitle["829"], Date.parse("2026-09-03T00:00:00Z"));
});

test("failed and empty lookups retry after twelve hours; valid dates stay cached", () => {
  for (const status of ["failed", "empty"]) {
    const cache = { releaseAtByTitle: {}, lookupByTitle: { 816: { status, attemptedAt: 1000 } } };
    assert.equal(context.shouldRetryDjPowerReleaseLookup(cache, "816", 43200999), false);
    assert.equal(context.shouldRetryDjPowerReleaseLookup(cache, "816", 43201000), true);
  }
  assert.equal(context.shouldRetryDjPowerReleaseLookup({ releaseAtByTitle: { 816: 1787227440000 } }, "816"), false);
  assert.equal(context.shouldRetryDjPowerReleaseLookup({ releaseAtByTitle: {}, checkedTitles: { 816: true } }, "816"), true);
});

test("NEW expires at the next update after six months", () => {
  vm.runInContext(`state.djPowerHistoryCatalog = { 781: { title: 781, dlcCode: 'OGK' } }; state.djPowerHistoryReleaseAtByTitle = { 781: Date.parse('2026-03-26T00:00:00Z') }; state.djPowerHistoryUpdateTimes = [Date.parse('2026-09-17T00:00:00Z'), Date.parse('2026-10-20T00:00:00Z')];`, context);
  assert.equal(context.isDjPowerNewAt({ title: 781 }, Date.parse("2026-10-13T00:00:00Z")), true);
  assert.equal(context.isDjPowerNewAt({ title: 781 }, Date.parse("2026-10-20T00:00:00Z")), false);
});

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const app = await readFile(new URL("../web/app.js", import.meta.url), "utf8");
const workflow = await readFile(new URL("../.github/workflows/test-build.yml", import.meta.url), "utf8");
const staticBuilder = await readFile(new URL("../scripts/build-static.mjs", import.meta.url), "utf8");

test("date input formatter has one declaration", () => {
  assert.equal([...app.matchAll(/^function formatDateTimeInput\(/gm)].length, 1);
});

test("test updater publishes a unique verified ZIP before its manifest", () => {
  assert.match(workflow, /v-log-test-windows-x64-\$env:GITHUB_RUN_NUMBER\.zip/);
  assert.match(workflow, /Uploaded ZIP SHA-256 verification failed/);
  assert.ok(workflow.indexOf("Uploaded ZIP SHA-256 verification failed") < workflow.indexOf("gh release upload test-latest test-desktop-version.json"));
});

test("HTML is revalidated while hashed assets remain immutable", () => {
  assert.match(staticBuilder, /cacheControl: "no-cache, must-revalidate"/);
  assert.match(staticBuilder, /cacheControl: "public, max-age=31536000, immutable"/);
});

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const manifest = JSON.parse(await readFile(resolve(root, "web", "data", "tag-manifest.json"), "utf8"));
if (manifest?.schemaVersion !== 1) throw new Error("Unsupported tag manifest schema");
const scopes = manifest?.hangybot?.scopes || {};
const expectedScopes = ["4|SC", "5|SC", "6|SC", "8|SC"];
if (Object.keys(scopes).some((scope) => !expectedScopes.includes(scope))) throw new Error("Only SC Hangybot scopes may be published");
if (expectedScopes.some((scope) => !scopes[scope])) throw new Error("A required Hangybot SC scope is missing");

const sources = [manifest.ropebot, ...expectedScopes.map((scope) => scopes[scope])];
for (const source of sources) {
  if (!source?.url?.startsWith("data/") || !source.version) throw new Error("Invalid tag source entry");
  const body = await readFile(resolve(root, "web", source.url));
  const version = createHash("sha256").update(body).digest("hex").slice(0, 12);
  if (version !== source.version) throw new Error(`${source.url}: hash mismatch`);
  const snapshot = JSON.parse(body);
  const count = snapshot.rows?.length ?? snapshot.tagRows?.length ?? 0;
  if (count !== source.count) throw new Error(`${source.url}: count mismatch`);
  if (snapshot.scope && Object.keys(snapshot.rawResponses || {}).length !== count) {
    throw new Error(`${source.url}: raw response count mismatch`);
  }
  console.log(`${source.url}: ${count} rows`);
}

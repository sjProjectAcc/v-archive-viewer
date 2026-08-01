import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dataDir = resolve(root, "web", "data");
const outputDir = resolve(root, "outputs");
const manifestPath = resolve(dataDir, "tag-manifest.json");
const songsUrl = "https://v-archive.net/db/v2/songs.json";
const ropebotTagsUrl = "https://fjwuuodmtttqohxsycvp.supabase.co/rest/v1/song_tags_2?select=song_title%2Ctags%2Caka&limit=1000";
const ropebotAbilityUrl = "https://fjwuuodmtttqohxsycvp.supabase.co/rest/v1/ability?select=id%2Cability_set&order=id";
const ropebotAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqd3V1b2RtdHR0cW9oeHN5Y3ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNDkwNjYsImV4cCI6MjA3MDcyNTA2Nn0.FItZtjt2v2otOUnmDtqhKG4IrPD4FjaRc_tVy-nxpsI";
const tagCodes = ["brain", "chord", "doubleTap", "jack", "longNote", "roll", "stream", "trill"];
const validButtons = new Set(["4", "5", "6", "8"]);
const validPatterns = new Set(["NM", "HD", "MX", "SC"]);
const args = new Set(process.argv.slice(2));
const valueAfter = (name) => {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
};
const updateRopebot = args.has("--ropebot") || (!args.has("--hangybot") && !args.has("--hangy-all"));
const updateHangybot = args.has("--hangybot") || args.has("--hangy-all");
const selectedButton = valueAfter("--button");
const selectedPattern = String(valueAfter("--pattern") || "").toUpperCase();

const sleep = (milliseconds) => new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds));
const hash = (body) => createHash("sha256").update(body).digest("hex").slice(0, 12);
const jsonFile = async (path, fallback) => {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
};
const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(30000) });
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status} · ${url}`);
    error.status = response.status;
    throw error;
  }
  return response.json();
};
const writeSnapshot = async (prefix, payload) => {
  const body = JSON.stringify(payload);
  const version = hash(body);
  const name = `${prefix}-${version}.json`;
  await writeFile(resolve(dataDir, name), body, "utf8");
  return { version, url: `data/${name}`, count: payload.rows?.length ?? payload.tagRows?.length ?? 0 };
};

await mkdir(dataDir, { recursive: true });
await mkdir(outputDir, { recursive: true });
const manifest = await jsonFile(manifestPath, { schemaVersion: 1, ropebot: null, hangybot: { scopes: {} } });
manifest.schemaVersion = 1;
manifest.hangybot ||= { scopes: {} };
manifest.hangybot.scopes ||= {};

let songs;
const loadSongs = async () => songs ||= await fetchJson(songsUrl);

if (updateRopebot) {
  const headers = { apikey: ropebotAnonKey, Authorization: `Bearer ${ropebotAnonKey}`, Accept: "application/json" };
  const [tagRows, abilityRows, songRows] = await Promise.all([
    fetchJson(ropebotTagsUrl, { headers }),
    fetchJson(ropebotAbilityUrl, { headers }),
    loadSongs(),
  ]);
  manifest.ropebot = await writeSnapshot("ropebot", { schemaVersion: 1, tagRows, abilityRows, songs: songRows });
  console.log(`Ropebot: ${tagRows.length} rows · ${manifest.ropebot.version}`);
}

async function collectHangyScope(button, pattern) {
  const scopeKey = `${button}|${pattern}`;
  const checkpointPath = resolve(outputDir, `hangybot-${button}-${pattern}.checkpoint.json`);
  const checkpoint = await jsonFile(checkpointPath, { rows: {} });
  const songRows = await loadSongs();
  const targets = songRows.flatMap((song) => {
    const patternData = song?.patterns?.[`${button}B`]?.[pattern];
    return patternData ? [{
      title: Number(song.title), button: Number(button), pattern,
      name: String(song.name || `#${song.title}`),
      level: patternData.level ?? null, floor: patternData.floor ?? null, floorName: patternData.floorName ?? null,
    }] : [];
  });
  let delayMs = 250;
  let completed = 0;
  for (const target of targets) {
    const key = `${target.title}|${button}|${pattern}`;
    if (checkpoint.rows[key]) continue;
    let attempts = 0;
    while (attempts < 5) {
      const startedAt = Date.now();
      try {
        const response = await fetchJson(`https://v-archive.net/api/v3/pattern-tag?title=${target.title}&button=${button}&pattern=${pattern}`);
        if (response?.success !== true) throw new Error("API success=false");
        const traits = Object.fromEntries((response?.data?.traits || []).map((trait) => [String(trait.tagCode || ""), Number(trait.value) || 0]));
        const values = Object.fromEntries(tagCodes.map((code) => [code, Number(traits[code]) || 0]));
        checkpoint.rows[key] = {
          ...target,
          name: response?.data?.song?.name || target.name,
          hangySong: response?.data?.song || {},
          hangyTags: Array.isArray(response?.data?.tags) ? response.data.tags : [],
          traits: values,
          traitTotal: tagCodes.reduce((sum, code) => sum + values[code], 0),
        };
        completed += 1;
        const elapsed = Date.now() - startedAt;
        delayMs = Math.max(100, Math.round((delayMs + elapsed) * 0.82));
        break;
      } catch (error) {
        attempts += 1;
        delayMs = Math.min(15000, Math.max(500, Math.round(delayMs * (error.status === 429 ? 4 : 2))));
        if (attempts >= 5) throw error;
        await sleep(delayMs);
      }
    }
    if (completed % 20 === 0) {
      await writeFile(checkpointPath, JSON.stringify(checkpoint), "utf8");
      console.log(`${scopeKey}: ${Object.keys(checkpoint.rows).length}/${targets.length} · delay ${delayMs}ms`);
    }
    await sleep(delayMs);
  }
  const rows = targets.map((target) => checkpoint.rows[`${target.title}|${button}|${pattern}`]).filter(Boolean);
  if (rows.length !== targets.length) throw new Error(`${scopeKey}: incomplete ${rows.length}/${targets.length}`);
  manifest.hangybot.scopes[scopeKey] = await writeSnapshot(`hangybot-${button}-${pattern}`, { schemaVersion: 1, scope: scopeKey, rows });
  await rm(checkpointPath, { force: true });
  console.log(`Hangybot ${scopeKey}: ${rows.length} rows · ${manifest.hangybot.scopes[scopeKey].version}`);
}

if (updateHangybot) {
  const scopes = args.has("--hangy-all")
    ? [...validButtons].map((button) => [button, "SC"])
    : [[selectedButton, selectedPattern]];
  for (const [button, pattern] of scopes) {
    if (!validButtons.has(button) || !validPatterns.has(pattern)) {
      throw new Error("--hangybot에는 --button 4|5|6|8 및 --pattern NM|HD|MX|SC가 필요합니다.");
    }
    if (!args.has("--force") && manifest.hangybot.scopes[`${button}|${pattern}`]) {
      console.log(`Hangybot ${button}|${pattern}: existing snapshot skipped`);
      continue;
    }
    await collectHangyScope(button, pattern);
  }
}

manifest.updatedAt = new Date().toISOString();
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Manifest: ${manifestPath}`);

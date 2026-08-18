import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../web/app.js", import.meta.url), "utf8");
const declarations = [...source.matchAll(/^function\s+([A-Za-z_$][\w$]*)\s*\(/gm)].map((match) => match[1]);
const duplicates = [...new Set(declarations.filter((name, index) => declarations.indexOf(name) !== index))];
if (duplicates.length) throw new Error(`Duplicate function declarations: ${duplicates.join(", ")}`);
for (const required of ["CALCULATION_MODEL_VERSION", "renderDataHealth", "exportLocalBackup", "renderGrowthDigest"]) {
  if (!source.includes(required)) throw new Error(`Required maintenance feature is missing: ${required}`);
}
console.log(`Validated ${declarations.length} function declarations with no duplicates.`);

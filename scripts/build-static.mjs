import { createHash } from "node:crypto";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const source = resolve(root, "web");
const output = resolve(root, "dist");
const serverOutput = resolve(output, "server");

const digest = (body) => createHash("sha256").update(body).digest("hex").slice(0, 12);
const sourceHtml = await readFile(resolve(source, "index.html"), "utf8");
const appBody = await readFile(resolve(source, "app.js"), "utf8");
const stylesBody = await readFile(resolve(source, "styles.css"), "utf8");
const downloadFile = "v-archive-viewer-windows-x64.zip";
const downloadPath = `/downloads/${downloadFile}`;
const downloadBody = await readFile(resolve(root, "downloads", downloadFile)).catch((error) => {
  if (error.code === "ENOENT") return null;
  throw error;
});
const packageConfig = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));
const appHash = digest(appBody);
const stylesHash = digest(stylesBody);
const downloadHash = downloadBody ? digest(downloadBody) : "source-only";
const desktopManifest = downloadBody
  ? JSON.stringify({
      version: packageConfig.version,
      url: `https://v-archive-viewer.ara-share.chatgpt.site${downloadPath}`,
      sha256: createHash("sha256").update(downloadBody).digest("hex"),
      size: downloadBody.length,
    })
  : null;
const appFile = `app.${appHash}.js`;
const stylesFile = `styles.${stylesHash}.css`;
const version = digest(`${sourceHtml}\0${appHash}\0${stylesHash}\0${downloadHash}`);
const versionCheck = `  <meta name="v-archive-version" content="${version}">
  <script>
    (() => {
      const current = "${version}";
      fetch("/version", { cache: "no-store" })
        .then((response) => response.ok ? response.text() : current)
        .then((latest) => {
          const next = latest.trim();
          if (next && next !== current) location.replace("/?v=" + encodeURIComponent(next));
        })
        .catch(() => {});
    })();
  </script>`;
const htmlBody = sourceHtml
  .replace('href="/styles.css"', `href="/${stylesFile}"`)
  .replace('src="/app.js"', `src="/${appFile}"`)
  .replace("</head>", `${versionCheck}\n</head>`);

await rm(output, { recursive: true, force: true });
await mkdir(serverOutput, { recursive: true });
await cp(resolve(root, ".openai"), resolve(output, ".openai"), { recursive: true }).catch((error) => {
  if (error.code !== "ENOENT") throw error;
});
await writeFile(resolve(output, "index.html"), htmlBody, "utf8");
await writeFile(resolve(output, appFile), appBody, "utf8");
await writeFile(resolve(output, stylesFile), stylesBody, "utf8");
await writeFile(resolve(output, "version"), version, "utf8");
if (downloadBody) {
  await mkdir(resolve(output, "downloads"), { recursive: true });
  await writeFile(resolve(output, "desktop-version.json"), desktopManifest, "utf8");
  await writeFile(resolve(output, "downloads", downloadFile), downloadBody);
}

const htmlAsset = {
  body: htmlBody,
  type: "text/html; charset=utf-8",
  etag: `"${version}"`,
  cacheControl: "private, max-age=31536000, immutable",
};
const assets = {
  "/": htmlAsset,
  "/index.html": htmlAsset,
  "/version": {
    body: version,
    type: "text/plain; charset=utf-8",
    etag: `"${version}"`,
    cacheControl: "no-store",
  },
  [`/${appFile}`]: {
    body: appBody,
    type: "application/javascript; charset=utf-8",
    etag: `"${appHash}"`,
    cacheControl: "public, max-age=31536000, immutable",
  },
  [`/${stylesFile}`]: {
    body: stylesBody,
    type: "text/css; charset=utf-8",
    etag: `"${stylesHash}"`,
    cacheControl: "public, max-age=31536000, immutable",
  },
};
if (downloadBody) {
  assets["/desktop-version.json"] = {
    body: desktopManifest,
    type: "application/json; charset=utf-8",
    etag: `"desktop-${packageConfig.version}-${downloadHash}"`,
    cacheControl: "no-store",
  };
  assets[downloadPath] = {
    body: downloadBody.toString("base64"),
    base64: true,
    type: "application/zip",
    etag: `"${downloadHash}"`,
    cacheControl: "public, max-age=3600",
    downloadName: downloadFile,
  };
}

const server = `const assets = ${JSON.stringify(assets)};
const version = ${JSON.stringify(version)};

async function handle(request) {
  const url = new URL(request.url);
  const asset = assets[url.pathname] || assets["/index.html"];
  const headers = {
    "content-type": asset.type,
    "cache-control": asset.cacheControl,
    "etag": asset.etag,
    "x-v-archive-version": version
  };
  if (asset.downloadName) headers["content-disposition"] = 'attachment; filename="' + asset.downloadName + '"';
  if (request.headers.get("if-none-match") === asset.etag) {
    return new Response(null, { status: 304, headers });
  }
  const body = asset.base64
    ? Uint8Array.from(atob(asset.body), (character) => character.charCodeAt(0))
    : asset.body;
  return new Response(body, { headers });
}

export default { fetch: handle };
export { handle as fetch };
`;

await writeFile(resolve(serverOutput, "index.js"), server, "utf8");
console.log(`Built V-ARCHIVE web version ${version}`);

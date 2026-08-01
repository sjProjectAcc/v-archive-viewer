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
const manifestConfig = JSON.parse(await readFile(resolve(source, "manifest.webmanifest"), "utf8"));
const serviceWorkerTemplate = await readFile(resolve(source, "sw.js"), "utf8");
const icon192Body = await readFile(resolve(source, "icons", "icon-192.png"));
const icon512Body = await readFile(resolve(source, "icons", "icon-512.png"));
const downloadFile = "v-archive-viewer-windows-x64.zip";
const downloadPath = `/downloads/${downloadFile}`;
const downloadBody = await readFile(resolve(root, "downloads", downloadFile)).catch((error) => {
  if (error.code === "ENOENT") return null;
  throw error;
});
const packageConfig = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));
const repository = process.env.GITHUB_REPOSITORY || "sjProjectAcc/v-archive-viewer";
const releaseTag = process.env.RELEASE_TAG || `v${packageConfig.version}`;
const normalizedBasePath = (process.env.PUBLIC_BASE_PATH || "").replace(/^\/+|\/+$/g, "");
const publicBasePath = normalizedBasePath ? `/${normalizedBasePath}/` : "/";
const publicAsset = (path) => `${publicBasePath}${path}`.replace(/\/{2,}/g, "/");
const downloadUrl = process.env.DESKTOP_DOWNLOAD_URL
  || `https://github.com/${repository}/releases/download/${releaseTag}/${downloadFile}`;
const copyDownloadToDist = process.env.COPY_DESKTOP_DOWNLOAD !== "false";
const appHash = digest(appBody);
const stylesHash = digest(stylesBody);
const iconVersion = packageConfig.version;
const icon192Url = `${publicAsset("icons/icon-192.png")}?v=${encodeURIComponent(iconVersion)}`;
const icon512Url = `${publicAsset("icons/icon-512.png")}?v=${encodeURIComponent(iconVersion)}`;
manifestConfig.id = publicBasePath;
manifestConfig.start_url = publicBasePath;
manifestConfig.scope = publicBasePath;
manifestConfig.icons = manifestConfig.icons.map((icon) => ({
  ...icon,
  src: icon.sizes === "512x512" ? icon512Url : icon192Url,
}));
const manifestBody = JSON.stringify(manifestConfig, null, 2);
const downloadHash = downloadBody ? digest(downloadBody) : "source-only";
const desktopManifest = downloadBody
  ? JSON.stringify({
      version: packageConfig.version,
      url: downloadUrl,
      sha256: createHash("sha256").update(downloadBody).digest("hex"),
      size: downloadBody.length,
    })
  : null;
const appFile = `app.${appHash}.js`;
const stylesFile = `styles.${stylesHash}.css`;
const version = digest(`${sourceHtml}\0${appHash}\0${stylesHash}\0${digest(manifestBody)}\0${digest(icon192Body)}\0${digest(icon512Body)}\0${downloadHash}`);
const appShell = [
  publicBasePath,
  publicAsset(appFile),
  publicAsset(stylesFile),
  publicAsset("manifest.webmanifest"),
  icon192Url,
  icon512Url,
];
const serviceWorkerBody = serviceWorkerTemplate
  .replace("__PWA_VERSION__", version)
  .replace('["__PWA_ASSETS__"]', JSON.stringify(appShell));
const versionCheck = `  <meta name="v-archive-version" content="${version}">`;
const htmlBody = sourceHtml
  .replace('href="/styles.css"', `href="${publicAsset(stylesFile)}"`)
  .replace('src="/app.js"', `src="${publicAsset(appFile)}"`)
  .replace('href="/manifest.webmanifest"', `href="${publicAsset("manifest.webmanifest")}"`)
  .replace('href="/icons/icon-192.png"', `href="${icon192Url}"`)
  .replace(`href="${downloadPath}"`, `href="${downloadUrl}"`)
  .replace("</head>", `${versionCheck}\n</head>`);

await rm(output, { recursive: true, force: true });
await mkdir(serverOutput, { recursive: true });
await cp(resolve(root, ".openai"), resolve(output, ".openai"), { recursive: true }).catch((error) => {
  if (error.code !== "ENOENT") throw error;
});
await writeFile(resolve(output, "index.html"), htmlBody, "utf8");
await writeFile(resolve(output, appFile), appBody, "utf8");
await writeFile(resolve(output, stylesFile), stylesBody, "utf8");
await writeFile(resolve(output, "manifest.webmanifest"), manifestBody, "utf8");
await writeFile(resolve(output, "sw.js"), serviceWorkerBody, "utf8");
await mkdir(resolve(output, "icons"), { recursive: true });
await writeFile(resolve(output, "icons", "icon-192.png"), icon192Body);
await writeFile(resolve(output, "icons", "icon-512.png"), icon512Body);
await cp(resolve(source, "data"), resolve(output, "data"), { recursive: true }).catch((error) => {
  if (error.code !== "ENOENT") throw error;
});
await writeFile(resolve(output, "version"), version, "utf8");
if (downloadBody) {
  await writeFile(resolve(output, "desktop-version.json"), desktopManifest, "utf8");
  if (copyDownloadToDist) {
    await mkdir(resolve(output, "downloads"), { recursive: true });
    await writeFile(resolve(output, "downloads", downloadFile), downloadBody);
  }
}
await writeFile(resolve(output, ".nojekyll"), "", "utf8");

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
  "/manifest.webmanifest": {
    body: manifestBody,
    type: "application/manifest+json; charset=utf-8",
    etag: `"manifest-${version}"`,
    cacheControl: "no-cache",
  },
  "/sw.js": {
    body: serviceWorkerBody,
    type: "application/javascript; charset=utf-8",
    etag: `"sw-${version}"`,
    cacheControl: "no-cache",
  },
  "/icons/icon-192.png": {
    body: icon192Body.toString("base64"),
    base64: true,
    type: "image/png",
    etag: `"icon-192-${iconVersion}"`,
    cacheControl: "public, max-age=31536000, immutable",
  },
  "/icons/icon-512.png": {
    body: icon512Body.toString("base64"),
    base64: true,
    type: "image/png",
    etag: `"icon-512-${iconVersion}"`,
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
  if (copyDownloadToDist) {
    assets[downloadPath] = {
      body: downloadBody.toString("base64"),
      base64: true,
      type: "application/zip",
      etag: `"${downloadHash}"`,
      cacheControl: "public, max-age=3600",
      downloadName: downloadFile,
    };
  }
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
console.log(`Built V-LOG web version ${version}`);

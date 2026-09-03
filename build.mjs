import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectDirectory = dirname(fileURLToPath(import.meta.url));
const outputDirectory = join(projectDirectory, "dist", "server");

const textAssets = [
  ["index.html", "text/html; charset=utf-8"],
  ["servizi.html", "text/html; charset=utf-8"],
  ["metodo.html", "text/html; charset=utf-8"],
  ["privacy.html", "text/html; charset=utf-8"],
  ["style.css", "text/css; charset=utf-8"],
  ["script.js", "text/javascript; charset=utf-8"],
  ["services.js", "text/javascript; charset=utf-8"],
  ["page-flow.js", "text/javascript; charset=utf-8"],
  ["logo-fatto.svg", "image/svg+xml; charset=utf-8"],
  ["whatsapp.svg", "image/svg+xml; charset=utf-8"]
].map(([file, type]) => [
  `/${file}`,
  { body: readFileSync(join(projectDirectory, file), "utf8"), encoding: "text", type }
]);

const binaryAssets = [[
  "/og.png",
  {
    body: readFileSync(join(projectDirectory, "og.png")).toString("base64"),
    encoding: "base64",
    type: "image/png"
  }
]];

const workerSource = `
const ASSETS = new Map(${JSON.stringify([...textAssets, ...binaryAssets])});

function decodeBase64(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function securityHeaders() {
  return {
    "Content-Security-Policy": "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY"
  };
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === "/" || pathname.endsWith("/")) pathname += pathname === "/" ? "index.html" : "index.html";

    const asset = ASSETS.get(pathname);
    if (!asset) {
      return new Response("Pagina non trovata", {
        status: 404,
        headers: { "Content-Type": "text/plain; charset=utf-8", ...securityHeaders() }
      });
    }

    let body = asset.encoding === "base64" ? decodeBase64(asset.body) : asset.body;
    if (asset.type.startsWith("text/html")) body = body.replaceAll("__FATTO_ORIGIN__", url.origin);

    const headers = {
      "Content-Type": asset.type,
      "Cache-Control": asset.type.startsWith("text/html") ? "no-cache" : "public, max-age=604800, immutable",
      ...securityHeaders()
    };

    return new Response(request.method === "HEAD" ? null : body, { status: 200, headers });
  }
};
`;

rmSync(join(projectDirectory, "dist"), { force: true, recursive: true });
mkdirSync(outputDirectory, { recursive: true });
writeFileSync(join(outputDirectory, "index.js"), workerSource.trimStart());
console.log("FATTO! pronto per la pubblicazione.");

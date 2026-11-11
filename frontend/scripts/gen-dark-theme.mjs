// Generates app/dark-theme.css from the Tailwind classes used in the code.
//
// The UI was written with light colors only (bg-slate-50, bg-white, text-slate-900...).
// Instead of adding dark: variants to every component, this script scans the source for
// those exact classes and emits overrides that apply when <html class="dark">.
//
// Re-run it after adding new hardcoded light classes:
//   node scripts/gen-dark-theme.mjs
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIRS = ["app", "components", "context", "lib"];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx|ts)$/.test(name)) out.push(p);
  }
  return out;
}

// Collect every quoted-looking color class token (with optional opacity suffix).
const tokens = new Set();
const tokenRe = /(?:[a-z0-9-]+:)*(?:bg|text|border|divide|ring|placeholder|from|via|to)-(?:\[#[0-9a-fA-F]{3,8}\]|[a-z]+-\d{2,3}|white)(?:\/\d+)?/g;
for (const d of DIRS) {
  for (const f of walk(join(root, d))) {
    for (const m of readFileSync(f, "utf8").matchAll(tokenRe)) tokens.add(m[0]);
  }
}

// Light palette -> dark palette.
const PAGE = "#0b1220";
const CARD = "#131c2f";
const SURFACE = "#151f33";
const SURFACE_2 = "#1c2740";

const SLATE_TEXT = { 100: "#e2e8f0", 200: "#e2e8f0", 300: "#cbd5e1", 400: "#8b9cbf", 500: "#94a3b8", 600: "#94a3b8", 700: "#cbd5e1", 800: "#e2e8f0", 900: "#f1f5f9", 950: "#f8fafc" };
const SLATE_BG = { 50: PAGE, 100: SURFACE, 200: SURFACE_2, 300: "#202c47", 700: "#2f3b58", 800: "#233049", 900: "#1b2438" };
const SLATE_BORDER = { 100: "rgba(148,163,184,0.15)", 200: "rgba(148,163,184,0.15)", 300: "#2b3a58" };

const ACCENT_600 = { indigo: "#a5b4fc", violet: "#a78bfa", purple: "#c084fc", blue: "#60a5fa", cyan: "#22d3ee", emerald: "#34d399", rose: "#fb7185", red: "#f87171", amber: "#fbbf24", orange: "#fdba74" };
const ACCENT_TINT = { indigo: [79, 70, 229], violet: [139, 92, 246], blue: [59, 130, 246], emerald: [16, 185, 129], rose: [244, 63, 94], amber: [245, 158, 11] };
const GRADIENT_50 = { indigo: "#182142", violet: "#1d1838", blue: "#131f3a" };

function rgba([r, g, b], a) {
  return `rgba(${r},${g},${b},${a})`;
}

// Returns [prop, value] or null for a base token (no variant prefix).
function rule(base) {
  let m;
  if ((m = base.match(/^text-slate-(\d+)/))) return SLATE_TEXT[m[1]] ? ["color", SLATE_TEXT[m[1]]] : null;
  if ((m = base.match(/^text-([a-z]+)-(\d+)/)) && ACCENT_600[m[1]] && +m[2] >= 600) {
    return ["color", ACCENT_600[m[1]]];
  }
  if ((m = base.match(/^bg-slate-(\d+)/))) return SLATE_BG[m[1]] ? ["background-color", SLATE_BG[m[1]]] : null;
  if (base === "bg-white" || /^bg-white\//.test(base)) return ["background-color", CARD];
  if ((m = base.match(/^bg-([a-z]+)-(\d+)(?:\/\d+)?/)) && ACCENT_TINT[m[1]] && +m[2] <= 100) {
    return ["background-color", rgba(ACCENT_TINT[m[1]], +m[2] <= 50 ? 0.16 : 0.24)];
  }
  if ((m = base.match(/^border-slate-(\d+)/))) return SLATE_BORDER[m[1]] ? ["border-color", SLATE_BORDER[m[1]]] : null;
  if ((m = base.match(/^divide-slate-(\d+)/))) return SLATE_BORDER[m[1]] ? ["border-color", SLATE_BORDER[m[1]]] : null;
  if ((m = base.match(/^border-([a-z]+)-(\d+)/)) && ACCENT_TINT[m[1]] && +m[2] <= 300) {
    return ["border-color", rgba(ACCENT_TINT[m[1]], 0.35)];
  }
  if ((m = base.match(/^ring-([a-z]+)-(\d+)/)) && ACCENT_TINT[m[1]] && +m[2] <= 100) {
    return ["--tw-ring-color", rgba(ACCENT_TINT[m[1]], 0.35)];
  }
  if ((m = base.match(/^placeholder-slate-(\d+)/)) && +m[1] >= 400 && +m[1] <= 500) {
    return ["color", "#64748b"];
  }
  if ((m = base.match(/^from-([a-z]+)-50/)) && GRADIENT_50[m[1]]) {
    return ["--tw-gradient-from", `${GRADIENT_50[m[1]]} var(--tw-gradient-from-position)`];
  }
  if ((m = base.match(/^to-([a-z]+)-50/)) && GRADIENT_50[m[1]]) {
    return ["--tw-gradient-to", `${GRADIENT_50[m[1]]} var(--tw-gradient-to-position)`];
  }
  if ((m = base.match(/^via-([a-z]+)-50/)) && GRADIENT_50[m[1]]) {
    return ["--tw-gradient-stops", `var(--tw-gradient-from), ${GRADIENT_50[m[1]]} var(--tw-gradient-via-position), var(--tw-gradient-to)`];
  }
  return null;
}

// Supported variant parts: pseudo/state and responsive breakpoints.
const PSEUDO = { hover: ":hover", focus: ":focus", "focus-visible": ":focus-visible", "focus-within": ":focus-within", active: ":active", selection: "::selection" };
const BREAKPOINTS = { sm: 640, md: 768, lg: 1024, xl: 1280, "2xl": 1536 };

const out = [];
const skipped = new Set();
for (const tok of [...tokens].sort()) {
  const parts = tok.split(":");
  const base = parts.pop();
  const r = rule(base);
  if (!r) continue;

  const attr = `[class~="${tok}"]`;
  let sel = `html.dark ${attr}`;
  let media = "";
  let ok = true;
  for (const part of parts) {
    if (BREAKPOINTS[part]) media = part;
    else if (part === "group-hover") sel = `html.dark .group:hover ${attr}`;
    else if (PSEUDO[part]) sel += PSEUDO[part];
    else { ok = false; break; }
  }
  if (!ok) { skipped.add(tok); continue; }
  const css = `${sel} { ${r[0]}: ${r[1]}; }`;
  out.push(media ? `@media (min-width:${BREAKPOINTS[media]}px){ ${css} }` : css);
}

const header = `/* GENERATED by scripts/gen-dark-theme.mjs. Do not edit by hand.
   Dark theme overrides for classes that were written light-only. Active when <html class="dark">. */

html.dark { color-scheme: dark; }
html.dark body { background-color: ${PAGE}; color: #f1f5f9; }
html.dark ::-webkit-scrollbar-track { background: ${PAGE}; }
html.dark ::-webkit-scrollbar-thumb { background: #334155; }
html.dark ::-webkit-scrollbar-thumb:hover { background: #475569; }

`;
const css = header + out.join("\n") + "\n";
writeFileSync(join(root, "app", "dark-theme.css"), css);
console.log(`wrote app/dark-theme.css with ${out.length} rules`);
if (skipped.size) console.log("skipped (unsupported variant):", [...skipped].join(", "));

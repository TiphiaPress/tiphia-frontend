import { defaultHighlightConfig, highlightStyleUrls, type HighlightConfig, type HighlightStyle } from "../config";
import prismUrl from "../vendor/prism.full.js?url";
import "./prismTypes";

const PRISM_SCRIPT_ID = "tiphia-highlight-prism";
const PRISM_STYLE_ID = "tiphia-highlight-prism-style";

let prismLoad: Promise<void> | null = null;

export async function loadPrism(config: HighlightConfig) {
  setThemeStyle(config.style);
  if (window.Prism?.highlightElement) return;

  if (!prismLoad) {
    prismLoad = new Promise((resolve, reject) => {
      const existing = document.getElementById(PRISM_SCRIPT_ID) as HTMLScriptElement | null;
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("failed to load Prism")), { once: true });
        return;
      }

      window.Prism = window.Prism || {};
      window.Prism.manual = true;
      const script = document.createElement("script");
      script.id = PRISM_SCRIPT_ID;
      script.src = prismUrl;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("failed to load Prism"));
      document.head.appendChild(script);
    });
  }

  await prismLoad;
}

function setThemeStyle(style: HighlightStyle) {
  const href = highlightStyleUrls[style] || highlightStyleUrls[defaultHighlightConfig.style];
  let link = document.getElementById(PRISM_STYLE_ID) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.id = PRISM_STYLE_ID;
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }
  if (link.href !== new URL(href, window.location.href).href) {
    link.href = href;
  }
}

const PRISM_COMPONENT_BASE = "https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/";
const languageLoads = new Map<string, Promise<void>>();

const LANGUAGE_DEPENDENCIES: Record<string, string[]> = {
  aspnet: ["markup", "csharp"],
  birb: ["clike"],
  bison: ["c"],
  c: ["clike"],
  cpp: ["c"],
  csharp: ["clike"],
  css: ["markup"],
  cssExtras: ["css"],
  dart: ["clike"],
  django: ["markup-templating"],
  erb: ["ruby", "markup-templating"],
  etlua: ["lua", "markup-templating"],
  fsharp: ["clike"],
  firestoreSecurityRules: ["clike"],
  flow: ["javascript"],
  glsl: ["clike"],
  go: ["clike"],
  groovy: ["clike"],
  haml: ["ruby"],
  java: ["clike"],
  javadoc: ["markup", "java", "javadoclike"],
  javastacktrace: ["java"],
  javascript: ["clike"],
  jsExtras: ["javascript"],
  jsTemplates: ["javascript"],
  json5: ["json"],
  jsonp: ["json"],
  jsdoc: ["javascript", "javadoclike", "typescript"],
  jsx: ["markup", "javascript"],
  kotlin: ["clike"],
  latte: ["clike", "markup-templating", "php"],
  less: ["css"],
  lilypond: ["scheme"],
  markdown: ["markup"],
  markupTemplating: ["markup"],
  n4js: ["javascript"],
  objectivec: ["c"],
  opencl: ["c"],
  parser: ["markup"],
  php: ["markup-templating"],
  phpExtras: ["php"],
  processing: ["clike"],
  protobuf: ["clike"],
  purebasic: ["clike"],
  purescript: ["haskell"],
  qml: ["javascript"],
  qore: ["clike"],
  r: ["clike"],
  reason: ["clike"],
  ruby: ["clike"],
  sass: ["css"],
  scss: ["css"],
  scala: ["java"],
  shellSession: ["bash"],
  smarty: ["markup-templating"],
  soy: ["markup-templating"],
  swift: ["clike"],
  tsx: ["jsx", "typescript"],
  tt2: ["clike", "markup-templating"],
  twig: ["markup"],
  typescript: ["javascript"],
  v: ["clike"],
  val: ["clike"],
  vbnet: ["basic"],
  velocity: ["markup"],
  wiki: ["markup"],
  xeora: ["markup"],
};

const COMPONENT_ALIASES: Record<string, string> = {
  html: "markup",
  xml: "markup",
  svg: "markup",
  mathml: "markup",
  ssml: "markup",
  atom: "markup",
  rss: "markup",
  js: "javascript",
  ts: "typescript",
  shell: "bash",
  sh: "bash",
  shellsession: "shell-session",
  shellSession: "shell-session",
  yml: "yaml",
  md: "markdown",
  rb: "ruby",
  py: "python",
  rs: "rust",
  kt: "kotlin",
  kts: "kotlin",
  ps1: "powershell",
  bat: "batch",
  docker: "dockerfile",
};

export async function ensurePrismLanguage(language: string) {
  const normalized = normalizeComponentLanguage(language);
  if (!normalized || window.Prism?.languages?.[normalized]) return;
  await loadLanguage(normalized);
}

async function loadLanguage(language: string): Promise<void> {
  const normalized = normalizeComponentLanguage(language);
  if (!normalized || window.Prism?.languages?.[normalized]) return;
  const existing = languageLoads.get(normalized);
  if (existing) return existing;

  const load = (async () => {
    const dependencies = LANGUAGE_DEPENDENCIES[toDependencyKey(normalized)] || [];
    for (const dependency of dependencies) {
      await loadLanguage(dependency);
    }
    if (window.Prism?.languages?.[normalized]) return;
    await appendLanguageScript(normalized);
  })().catch((error) => {
    languageLoads.delete(normalized);
    throw error;
  });

  languageLoads.set(normalized, load);
  return load;
}

function appendLanguageScript(language: string) {
  return new Promise<void>((resolve, reject) => {
    const id = `tiphia-highlight-prism-language-${language}`;
    const existing = document.getElementById(id) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`failed to load Prism language ${language}`)), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = id;
    script.src = `${PRISM_COMPONENT_BASE}prism-${language}.min.js`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`failed to load Prism language ${language}`));
    document.head.appendChild(script);
  });
}

function normalizeComponentLanguage(language: string) {
  return COMPONENT_ALIASES[language] || language;
}

function toDependencyKey(language: string) {
  return language.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
}




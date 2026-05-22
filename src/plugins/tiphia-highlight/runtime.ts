import { apiBase } from "../../blog/lib/api";

interface HighlightConfig {
  style: "github" | "one_light" | "dracula" | "solarized_dark";
  mac_window: boolean;
  show_language: boolean;
  line_wrap: boolean;
}

type TokenType = "plain" | "keyword" | "string" | "comment" | "number" | "function";

interface Token {
  type: TokenType;
  value: string;
}

const defaultConfig: HighlightConfig = {
  style: "github",
  mac_window: true,
  show_language: true,
  line_wrap: false,
};

let configCache: Promise<HighlightConfig> | null = null;

export function enhanceCodeBlocks() {
  let cancelled = false;
  const run = () => {
    if (cancelled) {
      return;
    }
    getConfig()
      .then((config) => {
        if (!cancelled) {
          applyHighlight(config);
        }
      })
      .catch(() => {
        if (!cancelled) {
          applyHighlight(defaultConfig);
        }
      });
  };

  run();
  const observer = new MutationObserver(run);
  observer.observe(document.body, { childList: true, subtree: true });

  return () => {
    cancelled = true;
    observer.disconnect();
  };
}

function getConfig() {
  if (!configCache) {
    configCache = fetch(`${apiBase}/api/v1/highlight/config`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response.json() as Promise<Partial<HighlightConfig>>;
      })
      .then((config) => ({ ...defaultConfig, ...config, style: readStyle(config.style) }));
  }
  return configCache;
}

function applyHighlight(config: HighlightConfig) {
  document.querySelectorAll<HTMLElement>(".article .content pre").forEach((pre) => enhanceBlock(pre, config));
}

function enhanceBlock(pre: HTMLElement, config: HighlightConfig) {
  const code = pre.querySelector("code");
  if (!code) {
    return;
  }

  const language = detectLanguage(code);
  const source = readOriginalSource(code);
  const key = configKey(config, source, language);
  if (pre.dataset.tiphiaHighlighted === key) {
    return;
  }

  code.dataset.tiphiaSource = source;
  code.innerHTML = highlight(source, language);

  pre.dataset.tiphiaHighlighted = key;
  pre.classList.add("tiphia-code-pre");
  pre.classList.toggle("wrap", config.line_wrap);

  let block = pre.closest<HTMLElement>(".tiphia-code-block");
  if (!block) {
    block = document.createElement("div");
    block.className = "tiphia-code-block";
    pre.parentNode?.insertBefore(block, pre);
    block.appendChild(pre);
  }

  block.className = `tiphia-code-block style-${config.style}`;
  block.classList.toggle("mac-window", config.mac_window);
  block.classList.toggle("wrap", config.line_wrap);

  let header = block.querySelector<HTMLElement>(".tiphia-code-header");
  if (!header) {
    header = document.createElement("div");
    header.className = "tiphia-code-header";
    block.insertBefore(header, pre);
  }
  header.innerHTML = `${config.mac_window ? '<span class="tiphia-window-dots" aria-hidden="true"><i></i><i></i><i></i></span>' : '<span></span>'}${config.show_language ? `<span class="tiphia-code-language">${escapeHtml(language)}</span>` : ""}`;
}

function readOriginalSource(code: HTMLElement) {
  return code.dataset.tiphiaSource ?? code.textContent ?? "";
}

function detectLanguage(code: Element) {
  const className = code.className || code.parentElement?.className || "";
  const match = className.match(/language-([\w-]+)|lang-([\w-]+)/i);
  if (match?.[1] || match?.[2]) {
    return (match[1] || match[2]).toLowerCase();
  }
  const text = code.textContent || "";
  if (/\b(#include|std::|cout|cin|namespace)\b/.test(text)) return "cpp";
  if (/\b(fn|let|mut|impl|trait|pub|use)\b/.test(text)) return "rust";
  if (/\b(import|export|const|let|function|return)\b/.test(text)) return "typescript";
  if (/\b(def|class|import|from|return)\b/.test(text)) return "python";
  if (/^\s*[<{][\s\S]*[>}]\s*$/.test(text)) return text.trim().startsWith("<") ? "html" : "json";
  return "text";
}

function highlight(source: string, language: string) {
  return tokenize(source, language)
    .map((token) => {
      const value = escapeHtml(token.value);
      return token.type === "plain" ? value : `<span class="token ${token.type}">${value}</span>`;
    })
    .join("");
}

function tokenize(source: string, language: string): Token[] {
  const tokens: Token[] = [];
  const pattern = /(\/\/.*?$|#include\s*<[^>]+>|#.*?$|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`[\s\S]*?`|\b\d+(?:\.\d+)?\b|\b[A-Za-z_$][\w$]*\b)/gm;
  let index = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(source))) {
    if (match.index > index) {
      tokens.push({ type: "plain", value: source.slice(index, match.index) });
    }
    tokens.push(classifyToken(match[0], language, source.slice(pattern.lastIndex)));
    index = pattern.lastIndex;
  }

  if (index < source.length) {
    tokens.push({ type: "plain", value: source.slice(index) });
  }
  return tokens;
}

function classifyToken(value: string, language: string, rest: string): Token {
  if (value.startsWith("#include")) {
    return { type: "keyword", value };
  }
  if (value.startsWith("//") || value.startsWith("/*") || value.startsWith("#")) {
    return { type: "comment", value };
  }
  if (value.startsWith("\"") || value.startsWith("'") || value.startsWith("`")) {
    return { type: "string", value };
  }
  if (/^\d/.test(value)) {
    return { type: "number", value };
  }
  if (keywordsFor(language).includes(value)) {
    return { type: "keyword", value };
  }
  if (/^\s*\(/.test(rest)) {
    return { type: "function", value };
  }
  return { type: "plain", value };
}

function keywordsFor(language: string) {
  const common = ["return", "if", "else", "for", "while", "break", "continue", "true", "false", "null"];
  if (["typescript", "javascript", "tsx", "jsx"].includes(language)) {
    return [...common, "import", "export", "const", "let", "var", "function", "class", "extends", "async", "await", "type", "interface"];
  }
  if (language === "rust") {
    return [...common, "fn", "let", "mut", "pub", "use", "impl", "trait", "struct", "enum", "match", "async", "await", "Self", "mod"];
  }
  if (language === "python") {
    return [...common, "def", "class", "from", "import", "as", "with", "try", "except", "finally", "None", "True", "False"];
  }
  if (["cpp", "c++", "c"].includes(language)) {
    return [...common, "using", "namespace", "int", "void", "auto", "const", "class", "struct", "public", "private", "include"];
  }
  return common;
}

function readStyle(value: unknown): HighlightConfig["style"] {
  return value === "one_light" || value === "dracula" || value === "solarized_dark" || value === "github" ? value : defaultConfig.style;
}

function configKey(config: HighlightConfig, source: string, language: string) {
  return `${config.style}:${config.mac_window}:${config.show_language}:${config.line_wrap}:${language}:${source.length}`;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char] || char));
}


import { highlightStyleClass, type HighlightConfig } from "../config";
import { detectLanguage, normalizeLanguage, resolvePrismLanguage } from "../languages";
import { cleanupPrismPlugins } from "./cleanup";
import { ensurePrismLanguage } from "./prismLoader";
import { copyCode } from "./clipboard";
import { configKey, escapeHtml, mergeCodeClass, readOriginalSource } from "./domText";
import "./prismTypes";

export async function enhanceBlock(pre: HTMLElement, config: HighlightConfig, force = false) {
  const code = pre.querySelector("code");
  if (!code) return;

  const source = readOriginalSource(code);
  const detectedLanguage = normalizeLanguage(detectLanguage(code, source));
  await ensurePrismLanguage(detectedLanguage).catch(() => undefined);
  const language = resolvePrismLanguage(detectedLanguage, window.Prism?.languages);
  const key = configKey(config, source, language);
  if (!force && pre.dataset.tiphiaHighlighted === key) {
    cleanupPrismPlugins(pre.closest<HTMLElement>(".tiphia-code-block"), pre);
    return;
  }

  code.className = mergeCodeClass(code.className, language);
  code.dataset.tiphiaSource = source;
  renderHighlightedCode(code, source, language);

  pre.dataset.tiphiaHighlighted = key;
  pre.classList.add("tiphia-code-pre");
  pre.classList.toggle("wrap", config.line_wrap);
  pre.classList.remove("line-numbers");

  const block = ensureBlock(pre);
  block.className = `tiphia-code-block prism-style-${highlightStyleClass(config.style)}`;
  block.classList.toggle("mac-window", config.mac_window);
  block.classList.toggle("wrap", config.line_wrap);
  block.classList.toggle("with-line-numbers", config.line_numbers);

  const header = ensureHeader(block, pre, config, language);
  const body = ensureCodeBody(block, header, pre);
  ensureCopyButton(body, source);
  renderLineNumbers(body, source, config.line_numbers);
  cleanupPrismPlugins(block, pre);
  queueMicrotask(() => cleanupPrismPlugins(block, pre));
}

function ensureBlock(pre: HTMLElement) {
  let block = pre.closest<HTMLElement>(".tiphia-code-block");
  if (!block) {
    block = document.createElement("div");
    block.className = "tiphia-code-block";
    pre.parentNode?.insertBefore(block, pre);
    block.appendChild(pre);
  }
  return block;
}

function renderHighlightedCode(code: HTMLElement, source: string, language: string) {
  const grammar = window.Prism?.languages?.[language];
  if (grammar && window.Prism?.highlight) {
    code.innerHTML = window.Prism.highlight(source, grammar, language);
    return;
  }
  code.textContent = source;
}

function ensureHeader(block: HTMLElement, pre: HTMLElement, config: HighlightConfig, language: string) {
  let header = block.querySelector<HTMLElement>(".tiphia-code-header");
  if (!header) {
    header = document.createElement("div");
    header.className = "tiphia-code-header";
    block.insertBefore(header, pre.closest(".tiphia-code-body") || pre);
  }

  header.innerHTML = `
    ${config.mac_window ? '<span class="tiphia-window-dots" aria-hidden="true"><i></i><i></i><i></i></span>' : '<span></span>'}
    ${config.show_language ? `<span class="tiphia-code-language">${escapeHtml(language)}</span>` : ""}
  `;
  return header;
}

function ensureCodeBody(block: HTMLElement, header: HTMLElement, pre: HTMLElement) {
  let body = pre.closest<HTMLElement>(".tiphia-code-body");
  if (!body) {
    body = document.createElement("div");
    body.className = "tiphia-code-body";
    block.insertBefore(body, header.nextSibling);
    body.appendChild(pre);
  }
  return body;
}

function ensureCopyButton(body: HTMLElement, source: string) {
  let button = body.querySelector<HTMLButtonElement>(".tiphia-code-copy");
  if (!button) {
    button = document.createElement("button");
    button.className = "tiphia-code-copy";
    button.type = "button";
    button.setAttribute("aria-label", "Copy code");
    body.appendChild(button);
  }
  button.textContent = "Copy";
  button.onclick = async () => {
    await copyCode(source);
    button.textContent = "Copied";
    window.setTimeout(() => {
      button.textContent = "Copy";
    }, 1200);
  };
}

function renderLineNumbers(body: HTMLElement, source: string, enabled: boolean) {
  let lines = body.querySelector<HTMLElement>(".tiphia-code-lines");
  if (!enabled) {
    lines?.remove();
    return;
  }
  if (!lines) {
    lines = document.createElement("div");
    lines.className = "tiphia-code-lines";
    body.insertBefore(lines, body.firstChild);
  }
  const count = Math.max(1, source.replace(/\n$/, "").split(/\r?\n/).length);
  lines.innerHTML = Array.from({ length: count }, (_, index) => `<span>${index + 1}</span>`).join("");
}



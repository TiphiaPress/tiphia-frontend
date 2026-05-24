export function readOriginalSource(code: HTMLElement) {
  return code.dataset.tiphiaSource ?? code.textContent ?? "";
}

export function mergeCodeClass(className: string, language: string) {
  const rest = className
    .split(/\s+/)
    .filter((item) => item && !item.startsWith("language-") && !item.startsWith("lang-"));
  return [...rest, `language-${language}`].join(" ");
}

export function configKey(config: {
  style: string;
  mac_window: boolean;
  show_language: boolean;
  line_wrap: boolean;
  line_numbers: boolean;
}, source: string, language: string) {
  return `${config.style}:${config.mac_window}:${config.show_language}:${config.line_wrap}:${config.line_numbers}:${language}:${source.length}`;
}

export function escapeHtml(value: string) {
  return value.replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char] || char));
}

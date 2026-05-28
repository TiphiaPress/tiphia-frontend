export const LANGUAGE_ALIASES = new Map<string, string>([
  ["html", "html"], ["xml", "xml"], ["svg", "markup"], ["mathml", "markup"], ["markup", "markup"], ["xhtml", "html"],
  ["js", "javascript"], ["mjs", "javascript"], ["cjs", "javascript"], ["javascript", "javascript"], ["jsx", "jsx"],
  ["ts", "typescript"], ["typescript", "typescript"], ["tsx", "tsx"],
  ["c", "c"], ["cpp", "cpp"], ["c++", "cpp"], ["cc", "cpp"], ["cxx", "cpp"], ["h", "c"], ["hpp", "cpp"], ["hxx", "cpp"],
  ["csharp", "csharp"], ["c#", "csharp"], ["cs", "csharp"],
  ["java", "java"], ["kotlin", "kotlin"], ["kt", "kotlin"], ["kts", "kotlin"], ["scala", "scala"], ["sc", "scala"],
  ["python", "python"], ["py", "python"], ["py3", "python"], ["python3", "python"], ["pyi", "python"], ["pyx", "cython"], ["cython", "cython"],
  ["ruby", "ruby"], ["rb", "ruby"], ["gemspec", "ruby"], ["erb", "erb"],
  ["go", "go"], ["golang", "go"], ["rust", "rust"], ["rs", "rust"], ["swift", "swift"],
  ["php", "php"], ["php3", "php"], ["php4", "php"], ["php5", "php"], ["php7", "php"], ["php8", "php"],
  ["perl", "perl"], ["pl", "perl"], ["pm", "perl"], ["perl6", "perl6"], ["raku", "raku"],
  ["r", "r"], ["rscript", "r"], ["julia", "julia"], ["jl", "julia"], ["lua", "lua"], ["groovy", "groovy"], ["gvy", "groovy"], ["dart", "dart"],
  ["elixir", "elixir"], ["ex", "elixir"], ["exs", "elixir"], ["erlang", "erlang"], ["erl", "erlang"],
  ["haskell", "haskell"], ["hs", "haskell"], ["lhs", "haskell"], ["ocaml", "ocaml"], ["ml", "ocaml"], ["mli", "ocaml"], ["mll", "ocaml"], ["mly", "ocaml"],
  ["clojure", "clojure"], ["clj", "clojure"], ["cljs", "clojure"], ["cljc", "clojure"], ["edn", "clojure"],
  ["lisp", "lisp"], ["cl", "commonlisp"], ["commonlisp", "commonlisp"], ["scheme", "scheme"], ["scm", "scheme"],
  ["pascal", "pascal"], ["pas", "pascal"], ["delphi", "delphi"], ["dpr", "delphi"],
  ["fortran", "fortran"], ["f", "fortran"], ["f90", "fortran"], ["f95", "fortran"], ["f03", "fortran"], ["f08", "fortran"],
  ["cobol", "cobol"], ["cbl", "cobol"], ["cpy", "cobol"], ["ada", "ada"], ["adb", "ada"], ["ads", "ada"],
  ["matlab", "matlab"], ["m", "matlab"], ["octave", "octave"],
  ["sh", "bash"], ["shell", "bash"], ["shell-script", "bash"], ["shellsession", "bash"], ["zsh", "bash"], ["fish", "bash"], ["console", "bash"], ["terminal", "bash"], ["bash", "bash"], ["ksh", "bash"],
  ["cmd", "cmd"], ["bat", "batch"], ["batch", "batch"], ["powershell", "powershell"], ["ps1", "powershell"], ["psm1", "powershell"], ["psd1", "powershell"],
  ["yaml", "yaml"], ["yml", "yaml"], ["json", "json"], ["jsonc", "jsonc"], ["json5", "json5"], ["toml", "toml"], ["ini", "ini"], ["cfg", "ini"], ["conf", "ini"], ["properties", "properties"], ["env", "dotenv"], ["plist", "plist"],
  ["markdown", "markdown"], ["md", "markdown"], ["mdown", "markdown"], ["rst", "rst"], ["tex", "latex"], ["latex", "latex"], ["bib", "latex"],
  ["sql", "sql"], ["mysql", "sql"], ["mariadb", "sql"], ["postgresql", "sql"], ["postgres", "sql"], ["pgsql", "sql"], ["plsql", "plsql"], ["tsql", "tsql"], ["sqlite", "sql"],
  ["pug", "pug"], ["jade", "pug"], ["ejs", "ejs"], ["handlebars", "handlebars"], ["hbs", "handlebars"], ["mustache", "mustache"], ["njk", "nunjucks"], ["nunjucks", "nunjucks"], ["twig", "twig"], ["vue", "vue"], ["svelte", "svelte"], ["astro", "astro"],
  ["css", "css"], ["less", "less"], ["scss", "scss"], ["sass", "sass"], ["stylus", "stylus"], ["postcss", "postcss"],
  ["dockerfile", "dockerfile"], ["docker", "dockerfile"], ["makefile", "makefile"], ["make", "makefile"], ["mk", "makefile"], ["cmake", "cmake"], ["nginx", "nginx"], ["apache", "apacheconf"], ["apacheconf", "apacheconf"],
  ["git", "git"], ["gitignore", "git"], ["graphql", "graphql"], ["gql", "graphql"], ["protobuf", "protobuf"], ["proto", "protobuf"], ["thrift", "thrift"], ["diff", "diff"], ["patch", "diff"], ["log", "log"],
  ["plaintext", "plaintext"], ["text", "plaintext"], ["txt", "plaintext"], ["plain", "plaintext"],
  ["angular", "typescript"], ["regex", "regex"], ["regexp", "regex"], ["rest", "rest"], ["http", "http"],
]);

export function normalizeLanguage(language: string): string {
  const raw = language.toLowerCase().replace(/^language-/, "").replace(/^lang-/, "").trim();
  return LANGUAGE_ALIASES.get(raw) ?? raw;
}

export function detectLanguage(code: Element, source: string) {
  const explicit = readExplicitLanguage(code);
  if (explicit) return explicit;
  if (looksLikePhp(source)) return "php";
  if (looksLikeSql(source)) return "sql";
  if (looksLikeShell(source)) return "bash";
  if (/\b(#include|std::|cout|cin|namespace)\b/.test(source)) return "cpp";
  if (/\b(fn|let|mut|impl|trait|pub|use)\b/.test(source)) return "rust";
  if (/\b(package|public|private|protected|class|interface|extends|implements|jakarta\.|lombok\.|String)\b/.test(source)) return "java";
  if (/\b(import|export|const|let|function|return)\b/.test(source)) return "typescript";
  if (/\b(def|class|import|from|return)\b/.test(source)) return "python";
  if (/^\s*[<{][\s\S]*[>}]\s*$/.test(source)) return source.trim().startsWith("<") ? "markup" : "json";
  return "text";
}

export function knownLanguageAlias(value: string, languages?: Record<string, unknown>) {
  const normalized = normalizeLanguage(value);
  if (normalized === "text" || normalized === "plaintext") return true;
  return Boolean(languages?.[normalized]);
}

export function resolvePrismLanguage(language: string, languages?: Record<string, unknown>) {
  if (!languages || languages[language]) return language;
  switch (language) {
    case "typescript":
    case "tsx":
    case "jsx":
      return languages.javascript ? "javascript" : language;
    case "markdown":
      return languages.markdown ? "markdown" : "markup";
    default:
      return language;
  }
}

function readExplicitLanguage(code: Element) {
  const className = `${code.className || ""} ${code.parentElement?.className || ""}`;
  const direct = className.match(/(?:language|lang)-([\w#+.-]+)|brush:\s*([\w#+.-]+)/i);
  if (direct?.[1] || direct?.[2]) return direct[1] || direct[2];

  const dataLanguage = code.getAttribute("data-language") || code.parentElement?.getAttribute("data-language");
  if (dataLanguage) return dataLanguage;

  return className.split(/\s+/).map((item) => item.trim()).filter(Boolean).find((item) => knownLanguageAlias(item, window.Prism?.languages));
}


function looksLikePhp(source: string) {
  const trimmed = source.trim();
  if (/<\?(?:php|=)?/i.test(trimmed)) return true;
  if (/\b(?:namespace|use)\s+[A-Z_a-z\\][\w\\]*\s*;/m.test(trimmed) && /\$[A-Za-z_]\w*/.test(trimmed)) return true;
  if (/\b(?:public|protected|private)\s+(?:static\s+)?function\s+\w+\s*\(/.test(trimmed)) return true;
  if (/\b(?:echo|print|require|require_once|include|include_once|array|isset|empty|unset)\b/.test(trimmed) && /\$[A-Za-z_]\w*/.test(trimmed)) return true;
  if (/\$[A-Za-z_]\w*\s*=/.test(trimmed) && /(?:;|->|::)/.test(trimmed)) return true;
  if (/\bclass\s+\w+(?:\s+(?:extends|implements)\s+\w+)?\s*\{/.test(trimmed) && /\$[A-Za-z_]\w*/.test(trimmed)) return true;
  return false;
}
function looksLikeShell(source: string) {
  const trimmed = source.trim();
  if (/^#!\s*\/.*\b(?:ba|z|fi|c)?sh\b/m.test(trimmed)) return true;
  if (/^\s*(?:sudo\s+)?(?:apt(?:-get)?|yum|dnf|brew|npm|yarn|pnpm|cargo|git|docker|kubectl|ssh|scp|rsync|cd|ls|mkdir|rm|cp|mv|cat|grep|sed|awk|curl|wget|chmod|chown|export|source)\b/m.test(trimmed)) return true;
  return /\b(?:if|then|fi|elif|case|esac|for|do|done)\b/.test(trimmed) && /(?:\$\w+|\|\||&&|;)/.test(trimmed);
}

function looksLikeSql(source: string) {
  const sqlKeywords = /\b(create|alter|drop|truncate|select|insert|update|delete|database|schema|table|index|view|from|where|join|primary\s+key|foreign\s+key|auto_increment|varchar|timestamp|comment|constraint)\b/i;
  const sqlPunctuation = /;\s*(?:\r?\n|$)/;
  return sqlKeywords.test(source) && (sqlPunctuation.test(source) || /`[^`]+`/.test(source));
}



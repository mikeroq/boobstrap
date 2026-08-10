import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import css from "highlight.js/lib/languages/css";
import javascript from "highlight.js/lib/languages/javascript";
import plaintext from "highlight.js/lib/languages/plaintext";
import xml from "highlight.js/lib/languages/xml";

hljs.registerLanguage("bash", bash);
hljs.registerLanguage("css", css);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("plaintext", plaintext);
hljs.registerLanguage("xml", xml);

const languageFromLabel = (label) => {
  const normalized = label.toLowerCase();
  if (normalized.includes("html") || normalized.includes("markup")) return "xml";
  if (normalized.includes("css")) return "css";
  if (normalized.includes("javascript") || normalized.includes("jsx") || normalized.includes("react") || normalized.includes("alpine") || /\bjs\b/.test(normalized)) return "javascript";
  if (/terminal|shell|npm|pnpm|yarn|bun/.test(normalized)) return "bash";
  return null;
};

const inferLanguage = (code, source) => {
  if (code.dataset.language && hljs.getLanguage(code.dataset.language)) return code.dataset.language;

  const variant = code.closest("[data-code-variant-panel]")?.dataset.codeVariantPanel;
  if (variant === "react") return "javascript";
  if (variant === "js" || variant === "alpine") return source.trimStart().startsWith("<") ? "xml" : "javascript";

  const label = code.closest(".docs-code-block")?.querySelector(".docs-code-label > span")?.textContent ?? "";
  const labeledLanguage = languageFromLabel(label);
  if (labeledLanguage) return labeledLanguage;

  const trimmed = source.trimStart();
  if (trimmed.startsWith("<")) return "xml";
  if (/^(npm|pnpm|yarn|bun)\s/m.test(trimmed)) return "bash";
  if (/\b(?:import|export|const|let|function|return|await)\b|=>/.test(source)) return "javascript";
  if (/^(?::root|[.#a-z][^{\n]*\{)|--[a-z0-9-]+\s*:/im.test(trimmed)) return "css";
  return "plaintext";
};

export function highlightCodeElement(code) {
  if (!code) return null;

  const source = code.textContent;
  const language = inferLanguage(code, source);
  const result = hljs.highlight(source, { language, ignoreIllegals: true });

  code.classList.remove("hljs");
  [...code.classList].filter((name) => name.startsWith("language-")).forEach((name) => code.classList.remove(name));
  code.classList.add("hljs", `language-${language}`);
  code.dataset.highlighted = "yes";
  code.dataset.highlightLanguage = language;
  code.innerHTML = result.value;

  return language;
}

export function highlightCodeBlocks(root = document) {
  return [...root.querySelectorAll(".docs-code-block pre code, .bs-code-window pre code")]
    .map((code) => highlightCodeElement(code));
}

import "@boobstrap/boobstrap/dist/boobstrap.css";
import "../docs.css";
import { initBoobstrap } from "@boobstrap/boobstrap/js";

const previewStoragePrefix = "boobstrap-docs-preview:";
const key = new URLSearchParams(window.location.search).get("key");
let preview;
let previewFromSession = false;

if (key?.startsWith(previewStoragePrefix)) {
  try {
    const transferredSource = localStorage.getItem(key);
    const source = transferredSource ?? sessionStorage.getItem(key);
    previewFromSession = !transferredSource && Boolean(source);
    preview = JSON.parse(source);
    if (source) sessionStorage.setItem(key, source);
  } catch {
    preview = undefined;
  }
  localStorage.removeItem(key);
}

if (!preview?.html || (!previewFromSession && Date.now() - preview.createdAt > 60_000)) {
  document.querySelector(".docs-standalone-preview-status").textContent = "This preview is no longer available. Open it again from the documentation example.";
} else {
  document.title = `${preview.title} preview — Boobstrap`;
  document.documentElement.dataset.bsTheme = preview.theme;
  document.body.dataset.bsTheme = preview.theme;
  document.body.id = preview.id;
  document.body.className = ["docs-standalone-preview", preview.className].filter(Boolean).join(" ");
  if (preview.componentExample) document.body.dataset.componentExample = preview.componentExample;
  document.body.innerHTML = preview.html;
  initBoobstrap(document.body);
  document.documentElement.dataset.previewReady = "";
}

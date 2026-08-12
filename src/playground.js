import frameworkCss from "@boobstrap/boobstrap/dist/boobstrap.css?raw";
import "@boobstrap/boobstrap/dist/boobstrap.css";
import "./playground.css";

const starterHtml = `<header class="starter-header">
  <nav class="bs-container bs-flex bs-flex-wrap bs-items-center bs-justify-between bs-gap-3" aria-label="Primary navigation">
    <a class="starter-brand bs-inline-flex bs-items-center bs-gap-2 bs-no-underline" href="#home">
      <svg class="bs-icon bs-icon-lg" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-4.35-9.33-8.5C.75 9.08 2.16 5 6.25 5A6.2 6.2 0 0 1 12 8.75 6.2 6.2 0 0 1 17.75 5c4.09 0 5.5 4.08 3.58 7.5C19 16.65 12 21 12 21Z" /></svg>
      Boobstrap starter
    </a>
    <a class="bs-btn bs-btn-secondary bs-btn-sm" href="#features">Explore</a>
  </nav>
</header>

<main id="home">
  <section class="starter-hero bs-container bs-section bs-grid bs-gap-6" aria-labelledby="hero-title">
    <div class="bs-col-12 bs-col-lg-7">
      <span class="bs-badge bs-badge-primary">CSS-only foundation</span>
      <h1 class="bs-display bs-text-gradient bs-mt-4 bs-mb-4" id="hero-title">Build boldly.</h1>
      <p class="bs-lead bs-mb-6">Edit this starter, compose responsive utilities, and make the semantic tokens your own.</p>
      <a class="bs-btn bs-btn-primary bs-btn-lg" href="#features">See the components</a>
    </div>
    <aside class="bs-card bs-card-raised bs-col-12 bs-col-lg-5" aria-labelledby="card-title">
      <div class="bs-card-body">
        <h2 class="bs-card-title" id="card-title">Ready to shape</h2>
        <p class="bs-card-text bs-mb-4">Boobstrap handles the foundation. Your CSS sets the character.</p>
        <div class="bs-alert bs-alert-success" role="status">
          <svg class="bs-icon bs-icon-lg" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>
          <span><strong class="bs-alert-title">Preview ready</strong>HTML and CSS only.</span>
        </div>
      </div>
    </aside>
  </section>

  <section class="bs-container bs-section" id="features" aria-labelledby="features-title">
    <h2 id="features-title">Responsive by design</h2>
    <div class="bs-grid bs-gap-4">
      <article class="bs-card bs-col-12 bs-col-md-6"><div class="bs-card-body"><h3 class="bs-card-title">Theme tokens</h3><p class="bs-card-text bs-mb-0">One override updates the system.</p></div></article>
      <article class="bs-card bs-col-12 bs-col-md-6"><div class="bs-card-body"><h3 class="bs-card-title">Layout utilities</h3><p class="bs-card-text bs-mb-0">Mobile-first columns compose cleanly.</p></div></article>
    </div>
  </section>
</main>`;

const starterCss = `:root {
  --bs-color-primary: #7c5cff;
  --bs-color-primary-hover: #9b85ff;
  --bs-color-primary-active: #6243df;
  --bs-gradient-brand: linear-gradient(135deg, #a78bfa, #7c5cff 52%, #d83c87);
}

body {
  background: radial-gradient(circle at 85% 5%, rgb(124 92 255 / 18%), transparent 28rem), var(--bs-color-background);
}

.starter-header {
  padding-block: var(--bs-space-4);
  border-bottom: 1px solid var(--bs-color-border);
}

.starter-brand {
  color: var(--bs-color-text);
  font-weight: 750;
}

.starter-brand .bs-icon {
  color: var(--bs-color-primary-hover);
}

.starter-hero {
  min-height: 34rem;
  align-items: center;
}`;

const htmlEditor = document.querySelector("[data-html-editor]");
const cssEditor = document.querySelector("[data-css-editor]");
const preview = document.querySelector("[data-preview]");
const previewShell = document.querySelector("[data-preview-shell]");
const status = document.querySelector("[data-preview-status]");

const sanitizeHtml = (source) => {
  const documentFragment = new DOMParser().parseFromString(source, "text/html");
  documentFragment.querySelectorAll("script, noscript, iframe, object, embed, link, meta, base").forEach((node) => node.remove());
  documentFragment.querySelectorAll("*").forEach((element) => {
    [...element.attributes].forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim().toLowerCase();
      if (name.startsWith("on") || (["href", "src", "action", "formaction"].includes(name) && value.startsWith("javascript:"))) {
        element.removeAttribute(attribute.name);
      }
    });
  });
  return documentFragment.body.innerHTML;
};

const escapeStyleEnd = (source) => source.replaceAll(/<\/style/gi, "<\\/style");

const renderPreview = () => {
  const safeMarkup = sanitizeHtml(htmlEditor.value);
  const safeCss = escapeStyleEnd(cssEditor.value);
  preview.srcdoc = `<!doctype html><html lang="en" data-bs-theme="dark"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:; form-action 'none'; base-uri 'none'"><style>${frameworkCss}\n${safeCss}</style></head><body>${safeMarkup}</body></html>`;
  status.textContent = "Preview updated";
};

let renderFrame;
const schedulePreview = () => {
  window.cancelAnimationFrame(renderFrame);
  renderFrame = window.requestAnimationFrame(renderPreview);
};

const reset = () => {
  htmlEditor.value = starterHtml;
  cssEditor.value = starterCss;
  renderPreview();
  status.textContent = "Starter restored";
};

const copy = async (value, successMessage) => {
  try {
    await navigator.clipboard.writeText(value);
    status.textContent = successMessage;
  } catch {
    status.textContent = "Clipboard unavailable; select the source and copy it manually.";
  }
};

htmlEditor.addEventListener("input", schedulePreview);
cssEditor.addEventListener("input", schedulePreview);
document.querySelector("[data-reset]").addEventListener("click", reset);
document.querySelector("[data-copy-html]").addEventListener("click", () => copy(htmlEditor.value, "HTML copied"));
document.querySelector("[data-copy-css]").addEventListener("click", () => copy(cssEditor.value, "CSS copied"));
document.querySelector("[data-copy-page]").addEventListener("click", () => {
  const pageSource = `<!doctype html>\n<html lang="en" data-bs-theme="dark">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@boobstrap/boobstrap@0.4.0/dist/boobstrap.css" />\n  <style>\n${cssEditor.value}\n  </style>\n</head>\n<body>\n${htmlEditor.value}\n</body>\n</html>`;
  copy(pageSource, "Current page copied");
});

document.querySelectorAll("[data-preview-size]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-preview-size]").forEach((candidate) => candidate.setAttribute("aria-pressed", String(candidate === button)));
    previewShell.className = `playground-preview-shell preview-size-${button.dataset.previewSize}`;
    status.textContent = `${button.textContent} preview selected`;
  });
});

reset();

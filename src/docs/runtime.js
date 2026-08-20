import { initBoobstrap } from "@boobstrap/boobstrap/js";
import { initDataTablesDemo } from "../datatables-demo.js";
import { highlightCodeBlocks, highlightCodeElement } from "../syntax-highlighting.js";

const previewThemes = ["light", "dark"];
const themeAxes = {
  theme: ["dark", "light"],
  palette: ["rose", "violet", "blue", "teal", "amber"],
  radius: ["rounded", "square"],
};

const titleCase = (value) => value[0].toUpperCase() + value.slice(1);

const listen = (target, type, handler, options) => {
  target?.addEventListener(type, handler, options);
  return () => target?.removeEventListener(type, handler, options);
};

const setupPreviewThemes = (root) => {
  const cleanups = [];
  root.querySelectorAll(".docs-demo:not([data-theme-configurator])").forEach((preview) => {
    const initialTheme = document.documentElement.dataset.bsTheme === "light" ? "light" : "dark";
    preview.dataset.bsTheme = initialTheme;
    preview.dataset.previewThemeReady = "";

    const controls = document.createElement("span");
    controls.className = "docs-preview-theme-switch";
    controls.dataset.previewThemeControls = "";
    controls.setAttribute("role", "group");
    controls.setAttribute("aria-label", "Preview color theme");

    const setPreviewTheme = (theme) => {
      preview.dataset.bsTheme = theme;
      controls.querySelectorAll("[data-preview-theme-option]").forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.previewThemeOption === theme));
      });
    };

    previewThemes.forEach((theme) => {
      const button = document.createElement("button");
      button.className = "docs-preview-theme-button";
      button.dataset.previewThemeOption = theme;
      button.type = "button";
      button.textContent = titleCase(theme);
      button.setAttribute("aria-label", `Use ${theme} theme for this preview`);
      cleanups.push(listen(button, "click", () => setPreviewTheme(theme)));
      controls.append(button);
    });

    preview.prepend(controls);
    setPreviewTheme(initialTheme);
    cleanups.push(() => controls.remove());
  });
  return () => cleanups.forEach((cleanup) => cleanup());
};

const setupThemeConfigurator = (root) => {
  const cleanups = [];
  root.querySelectorAll("[data-theme-configurator]").forEach((configurator) => {
    const markup = configurator.nextElementSibling?.querySelector("[data-theme-markup]");
    const copyButton = configurator.nextElementSibling?.querySelector("[data-theme-copy]");
    const status = configurator.querySelector("[data-theme-status]");
    const summary = configurator.querySelector("[data-theme-summary]");
    const state = {
      theme: themeAxes.theme.includes(configurator.dataset.bsTheme) ? configurator.dataset.bsTheme : "dark",
      palette: themeAxes.palette.includes(configurator.dataset.bsPalette) ? configurator.dataset.bsPalette : "rose",
      radius: themeAxes.radius.includes(configurator.dataset.bsRadius) ? configurator.dataset.bsRadius : "rounded",
    };

    const render = () => {
      configurator.dataset.bsTheme = state.theme;
      configurator.dataset.bsPalette = state.palette;
      configurator.dataset.bsRadius = state.radius;
      configurator.querySelectorAll("[data-theme-axis][data-theme-value]").forEach((button) => {
        button.setAttribute("aria-pressed", String(state[button.dataset.themeAxis] === button.dataset.themeValue));
      });
      const selectionLabel = `${titleCase(state.theme)} · ${titleCase(state.palette)} · ${titleCase(state.radius)}`;
      if (summary) summary.textContent = selectionLabel;
      if (status) status.textContent = `Previewing ${state.theme} mode, ${state.palette} palette, and ${state.radius} corners.`;
      const source = `<html\n  data-bs-theme="${state.theme}"\n  data-bs-palette="${state.palette}"\n  data-bs-radius="${state.radius}"\n>`;
      if (markup) {
        markup.textContent = source;
        highlightCodeElement(markup);
      }
      if (copyButton) copyButton.dataset.copy = source;
    };

    configurator.querySelectorAll("[data-theme-axis][data-theme-value]").forEach((button) => {
      cleanups.push(listen(button, "click", () => {
        const { themeAxis: axis, themeValue: value } = button.dataset;
        if (!themeAxes[axis]?.includes(value)) return;
        state[axis] = value;
        render();
      }));
    });
    render();
  });
  return () => cleanups.forEach((cleanup) => cleanup());
};

const setupCopyControls = (root) => listen(root, "click", async (event) => {
  const button = event.target.closest("[data-copy], [data-copy-code]");
  if (!button || !root.contains(button)) return;
  const originalLabel = button.textContent;
  const source = button.dataset.copy
    ?? button.closest(".docs-code-block")?.querySelector("pre code")?.textContent.trim()
    ?? "";
  try {
    await navigator.clipboard.writeText(source);
    button.textContent = "Copied";
  } catch {
    button.textContent = "Select code";
  }
  window.setTimeout(() => {
    if (button.isConnected) button.textContent = originalLabel;
  }, 1400);
});

const setupTablist = (tabs, panels, valueFor, panelFor, onSelect = () => {}) => {
  const cleanups = [];
  const select = (tab, moveFocus = false) => {
    const value = valueFor(tab);
    const panel = panels.find((candidate) => panelFor(candidate) === value);
    tabs.forEach((candidate) => {
      const selected = candidate === tab;
      candidate.setAttribute("aria-selected", String(selected));
      candidate.tabIndex = selected ? 0 : -1;
    });
    panels.forEach((candidate) => { candidate.hidden = candidate !== panel; });
    onSelect({ value, panel, tab });
    if (moveFocus) tab.focus();
    return { value, panel };
  };

  tabs.forEach((tab, index) => {
    cleanups.push(listen(tab, "click", () => select(tab)));
    cleanups.push(listen(tab, "keydown", (event) => {
      let nextIndex;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
      else if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = tabs.length - 1;
      else return;
      event.preventDefault();
      select(tabs[nextIndex], true);
    }));
  });
  return { select, cleanup: () => cleanups.forEach((cleanup) => cleanup()) };
};

const setupFrameworkTabs = (root) => {
  const cleanups = [];
  root.querySelectorAll("[data-framework-tabs]").forEach((switcher) => {
    const tabs = [...switcher.querySelectorAll("[data-framework-tab]")];
    const panels = [...switcher.querySelectorAll("[data-framework-panel]")];
    cleanups.push(setupTablist(tabs, panels, (tab) => tab.dataset.frameworkTab, (panel) => panel.dataset.frameworkPanel).cleanup);
  });
  return () => cleanups.forEach((cleanup) => cleanup());
};

const setupCodeVariants = (root) => {
  const cleanups = [];
  root.querySelectorAll("[data-code-variants]").forEach((switcher) => {
    const tabs = [...switcher.querySelectorAll("[data-code-variant]")];
    const panels = [...switcher.querySelectorAll("[data-code-variant-panel]")];
    const copyButton = switcher.querySelector("[data-copy-example]");
    const codeLabel = switcher.querySelector("[data-code-label]");
    const tablist = setupTablist(
      tabs,
      panels,
      (tab) => tab.dataset.codeVariant,
      (panel) => panel.dataset.codeVariantPanel,
      (selection) => {
        if (copyButton) {
          copyButton.dataset.copy = selection.panel?.dataset.copySource ?? "";
          copyButton.dataset.copyVariant = selection.value;
        }
        if (codeLabel) codeLabel.textContent = `HTML · ${selection.tab.textContent}`;
      },
    );
    const selectedTab = tabs.find((tab) => tab.getAttribute("aria-selected") === "true") ?? tabs[0];
    if (selectedTab) tablist.select(selectedTab);
    cleanups.push(tablist.cleanup);
  });
  return () => cleanups.forEach((cleanup) => cleanup());
};

const setupPackageTabs = (root) => {
  const tabs = [...root.querySelectorAll("[data-package-command]")];
  if (!tabs.length) return () => {};
  const output = root.querySelector("[data-package-command-output]");
  const label = root.querySelector("[data-package-label]");
  const copy = root.querySelector("[data-package-copy]");
  const tablist = setupTablist(
    tabs,
    [],
    (tab) => tab.dataset.packageName,
    () => "",
    ({ tab }) => {
      if (output) {
        output.textContent = tab.dataset.packageCommand;
        highlightCodeElement(output);
      }
      if (label) label.textContent = tab.dataset.packageName;
      if (copy) copy.dataset.copy = tab.dataset.packageCommand;
    },
  );
  return tablist.cleanup;
};

const setupReferenceFilter = (root, inputSelector, targetSelector) => {
  const input = root.querySelector(inputSelector);
  const target = root.querySelector(targetSelector);
  if (!input || !target) return () => {};
  const originalGroups = [...target.children].map((group) => group.cloneNode(true));
  return listen(input, "input", () => {
    const query = input.value.trim().toLowerCase();
    const groups = originalGroups.map((original) => {
      const group = original.cloneNode(true);
      group.querySelectorAll(".reference-row").forEach((row) => {
        if (!row.textContent.toLowerCase().includes(query)) row.remove();
      });
      if (!group.querySelector(".reference-row")) return null;
      const count = group.querySelector(".reference-count");
      if (count) count.textContent = String(group.querySelectorAll(".reference-row").length);
      return group;
    }).filter(Boolean);
    target.replaceChildren(...groups);
    if (!groups.length) {
      const empty = document.createElement("p");
      empty.className = "reference-empty";
      empty.textContent = "No matching entries.";
      target.append(empty);
    }
  });
};

const setupNativeControlOutputs = (root) => {
  const cleanups = [];
  root.querySelectorAll("[data-native-output]").forEach((input) => {
    const output = root.querySelector(`#${CSS.escape(input.dataset.nativeOutput)}`);
    if (!output) return;
    const render = () => {
      output.value = input.type === "range" ? `${input.value}%` : input.value.toUpperCase();
    };
    cleanups.push(listen(input, "input", render));
    render();
  });
  return () => cleanups.forEach((cleanup) => cleanup());
};

const setupHeadingAnchors = (root, outline) => {
  outline.forEach(({ id, label }) => {
    const target = root.querySelector(`#${CSS.escape(id)}`);
    const heading = target?.matches("h2, h3") ? target : target?.querySelector(":scope > h2");
    if (!heading || heading.querySelector(":scope > .docs-heading-anchor")) return;
    const anchor = document.createElement("a");
    anchor.className = "docs-heading-anchor";
    anchor.href = `#${id}`;
    anchor.setAttribute("aria-label", `Link to ${label}`);
    anchor.textContent = "#";
    heading.append(anchor);
  });
};

export const initDocsPageRuntime = (root, { route, outline }) => {
  if (!root) return () => {};
  const cleanups = [];
  setupHeadingAnchors(root, outline);
  cleanups.push(setupPreviewThemes(root));
  cleanups.push(setupThemeConfigurator(root));
  cleanups.push(setupCopyControls(root));
  cleanups.push(setupFrameworkTabs(root));
  cleanups.push(setupCodeVariants(root));
  cleanups.push(setupPackageTabs(root));
  cleanups.push(setupReferenceFilter(root, "[data-class-filter]", "[data-class-reference]"));
  cleanups.push(setupReferenceFilter(root, "[data-token-filter]", "[data-token-reference]"));
  cleanups.push(setupNativeControlOutputs(root));
  root.querySelectorAll("[data-docs-form]").forEach((form) => cleanups.push(listen(form, "submit", (event) => event.preventDefault())));
  root.querySelectorAll("[data-demo-loading]").forEach((button) => cleanups.push(listen(button, "bs:button:started", (event) => {
    window.setTimeout(() => event.detail.controller.stop({ reason: "demo" }), 1200);
  })));

  highlightCodeBlocks(root);
  const framework = initBoobstrap(root);
  cleanups.push(() => framework.destroy());

  let dataTable;
  let disposed = false;
  if (route.sectionId === "table-datatables") {
    initDataTablesDemo(root).then((instance) => {
      if (disposed) instance?.destroy();
      else dataTable = instance;
    });
  }

  document.documentElement.classList.add("js-ready");
  return () => {
    disposed = true;
    dataTable?.destroy();
    cleanups.reverse().forEach((cleanup) => cleanup());
  };
};

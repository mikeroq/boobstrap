import "@boobstrap/boobstrap/dist/boobstrap.css";
import "./site.css";

const installTabs = [...document.querySelectorAll("[data-install-manager]")];
const installOutput = document.querySelector("[data-install-command-output]");
const installCopy = document.querySelector("[data-install-copy]");
const installStatus = document.querySelector("[data-install-status]");

const selectInstallTab = (tab, moveFocus = false) => {
  installTabs.forEach((candidate) => {
    const selected = candidate === tab;
    candidate.setAttribute("aria-selected", String(selected));
    candidate.tabIndex = selected ? 0 : -1;
  });

  const command = tab.dataset.installCommand;
  const manager = tab.dataset.installManager;
  if (installOutput) installOutput.textContent = command;
  if (installCopy) installCopy.setAttribute("aria-label", `Copy ${manager} installation command`);
  if (moveFocus) tab.focus();
};

installTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectInstallTab(tab));
  tab.addEventListener("keydown", (event) => {
    let nextIndex;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % installTabs.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + installTabs.length) % installTabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = installTabs.length - 1;
    if (nextIndex === undefined) return;
    event.preventDefault();
    selectInstallTab(installTabs[nextIndex], true);
  });
});

const copyText = async (value) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
};

installCopy?.addEventListener("click", async () => {
  const command = installOutput?.textContent?.trim();
  if (!command) return;

  try {
    await copyText(command);
    installCopy.dataset.copyState = "success";
    installCopy.querySelector("span").textContent = "Copied";
    if (installStatus) installStatus.textContent = `${command} copied to clipboard.`;
    window.setTimeout(() => {
      installCopy.removeAttribute("data-copy-state");
      installCopy.querySelector("span").textContent = "Copy";
    }, 1800);
  } catch {
    if (installStatus) installStatus.textContent = "Copy failed. Select the installation command and copy it manually.";
  }
});

document.documentElement.classList.add("js-ready");

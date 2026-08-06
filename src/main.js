import "./boobstrap.css";
import "./site.css";

const form = document.querySelector("[data-signup-form]");
const status = document.querySelector("[data-form-status]");

form?.addEventListener("submit", (event) => {
  event.preventDefault();

  const email = new FormData(form).get("email") || form.querySelector("input")?.value;
  const title = status?.querySelector(".bs-alert-title");
  const message = status?.querySelector("span:last-child");

  if (title) title.textContent = "You're covered";
  if (message) {
    message.lastChild.textContent = ` We’ll keep ${email} in the loop.`;
  }

  status?.classList.remove("bs-alert-primary");
  status?.classList.add("bs-alert-success");
  form.reset();
});

document.documentElement.classList.add("js-ready");

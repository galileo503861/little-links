import { addLink, readLinks } from "./links.js";

const storageKey = "little-links.items";
const form = document.querySelector("#add-link");
const urlInput = document.querySelector("#url");
const titleInput = document.querySelector("#title");
const list = document.querySelector("#links");
const empty = document.querySelector("#empty");
const message = document.querySelector("#message");
const count = document.querySelector("#count");
const filters = document.querySelectorAll("[data-filter]");
const clearRead = document.querySelector("#clear-read");
let filter = "all";
let links = [];

try {
  links = readLinks(localStorage.getItem(storageKey));
} catch {
  message.textContent = "Browser storage isn't available. You can still use this tab.";
}

function save() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(links));
  } catch {
    message.textContent = "Couldn't save this change. Keep this tab open if you need the list.";
  }
}

function render() {
  const unread = links.filter((link) => !link.read).length;
  count.textContent = `${unread} left to read`;
  clearRead.disabled = links.every((link) => !link.read);
  filters.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.filter === filter)));

  const visible = links.filter((link) => filter === "all" || (filter === "read" ? link.read : !link.read));
  list.replaceChildren();
  empty.hidden = visible.length > 0;
  empty.textContent = links.length === 0
    ? "Nothing saved yet. Drop a link in above."
    : "Nothing in this view. Try another filter.";

  for (const link of visible) {
    const row = document.createElement("li");
    row.className = link.read ? "link-card is-read" : "link-card";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = link.read;
    checkbox.setAttribute("aria-label", `Mark ${link.title} as ${link.read ? "unread" : "read"}`);
    checkbox.addEventListener("change", () => {
      links = links.map((item) => item.id === link.id ? { ...item, read: checkbox.checked } : item);
      message.textContent = "";
      save();
      render();
    });

    const info = document.createElement("div");
    info.className = "link-info";
    const anchor = document.createElement("a");
    anchor.href = link.url;
    anchor.textContent = link.title;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    const host = document.createElement("span");
    host.textContent = new URL(link.url).hostname;
    info.append(anchor, host);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "remove";
    remove.textContent = "Remove";
    remove.setAttribute("aria-label", `Remove ${link.title}`);
    remove.addEventListener("click", () => {
      links = links.filter((item) => item.id !== link.id);
      message.textContent = "";
      save();
      render();
    });
    row.append(checkbox, info, remove);
    list.append(row);
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  message.textContent = "";
  try {
    links = addLink(links, {
      id: crypto.randomUUID(),
      url: urlInput.value,
      title: titleInput.value,
      read: false,
      createdAt: Date.now(),
    });
    save();
    form.reset();
    render();
    urlInput.focus();
  } catch (problem) {
    message.textContent = problem.message;
  }
});

filters.forEach((button) => button.addEventListener("click", () => {
  filter = button.dataset.filter;
  render();
}));

clearRead.addEventListener("click", () => {
  links = links.filter((link) => !link.read);
  message.textContent = "";
  save();
  render();
});

render();

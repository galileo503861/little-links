import { addLink, filterLinks, readLinks } from "./links.js";
import { makeBackup, parseBackup, mergeLinks } from "./backup.js";

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
const searchInput = document.querySelector("#search");
const exportButton = document.querySelector("#export");
const importButton = document.querySelector("#import");
const importFile = document.querySelector("#import-file");
let filter = "all";
let links = [];

try {
  links = readLinks(localStorage.getItem(storageKey));
} catch {
  setMessage("Browser storage isn't available. You can still use this tab.");
}

function setMessage(text, kind = "error") {
  message.textContent = text;
  message.dataset.kind = kind;
}

function save() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(links));
    return true;
  } catch {
    setMessage("Couldn't save this change. Keep this tab open if you need the list.");
    return false;
  }
}

function render() {
  const unread = links.filter((link) => !link.read).length;
  count.textContent = `${unread} left to read`;
  clearRead.disabled = links.every((link) => !link.read);
  exportButton.disabled = links.length === 0;
  filters.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.filter === filter)));

  const visible = filterLinks(links, filter, searchInput.value);
  list.replaceChildren();
  empty.hidden = visible.length > 0;
  empty.textContent = links.length === 0
    ? "Nothing saved yet. Drop a link in above."
    : searchInput.value.trim()
      ? "No matching links. Try another search or filter."
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
      setMessage("");
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
      setMessage("");
      save();
      render();
    });
    row.append(checkbox, info, remove);
    list.append(row);
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  setMessage("");
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
    setMessage(problem.message);
  }
});

filters.forEach((button) => button.addEventListener("click", () => {
  filter = button.dataset.filter;
  render();
}));

searchInput.addEventListener("input", render);

clearRead.addEventListener("click", () => {
  links = links.filter((link) => !link.read);
  setMessage("");
  save();
  render();
});

exportButton.addEventListener("click", () => {
  const blob = new Blob([makeBackup(links)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "little-links.json";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

importButton.addEventListener("click", () => importFile.click());
importFile.addEventListener("change", async () => {
  const file = importFile.files[0];
  if (!file) return;
  setMessage("");
  importButton.disabled = true;
  try {
    if (file.size > 1024 * 1024) throw new Error("Choose a backup smaller than 1 MB.");
    const imported = parseBackup(await file.text());
    const merged = mergeLinks(links, imported);
    const added = merged.length - links.length;
    links = merged;
    if (added > 0) {
      filter = "all";
      searchInput.value = "";
    }
    if (save()) {
      setMessage(added > 0 ? `Imported ${added} ${added === 1 ? "link" : "links"}. Existing links were kept.` : "No new links to import.", "success");
    }
    render();
  } catch (problem) {
    setMessage(problem.message);
  } finally {
    importButton.disabled = false;
    importFile.value = "";
  }
});

render();

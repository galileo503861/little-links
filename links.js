export function tidyUrl(value) {
  let text = value.trim();
  if (!text) throw new Error("Add a link first.");
  if (!/^[a-z][a-z\d+.-]*:/i.test(text)) text = `https://${text}`;

  let url;
  try {
    url = new URL(text);
  } catch {
    throw new Error("That doesn't look like a web address.");
  }
  if (!["https:", "http:"].includes(url.protocol) || !url.hostname) {
    throw new Error("Only http and https links can go on the list.");
  }
  if (url.username || url.password) {
    throw new Error("Use a link without a username or password in it.");
  }
  return url.href;
}

export function addLink(links, entry) {
  const url = tidyUrl(entry.url);
  if (links.some((link) => link.url === url)) {
    throw new Error("That link is already on your list.");
  }
  const title = entry.title.trim() || new URL(url).hostname.replace(/^www\./, "");
  return [{ ...entry, title, url }, ...links];
}

export function readLinks(raw) {
  try {
    const saved = JSON.parse(raw);
    if (!Array.isArray(saved)) return [];
    const links = [];
    const ids = new Set();
    const urls = new Set();

    for (const item of saved) {
      if (!item || typeof item.id !== "string" || !item.id ||
          typeof item.title !== "string" || typeof item.url !== "string" ||
          typeof item.read !== "boolean" || !Number.isFinite(item.createdAt)) continue;
      try {
        const url = tidyUrl(item.url);
        if (ids.has(item.id) || urls.has(url)) continue;
        links.push({ id: item.id, title: item.title, url, read: item.read, createdAt: item.createdAt });
        ids.add(item.id);
        urls.add(url);
      } catch {
        // Keep usable entries if an older saved link is broken.
      }
    }
    return links;
  } catch {
    return [];
  }
}

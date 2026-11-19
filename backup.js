import { readLinks } from "./links.js";

export function makeBackup(links) {
  return JSON.stringify({ version: 1, links }, null, 2) + "\n";
}

export function parseBackup(raw) {
  let backup;
  try {
    backup = JSON.parse(raw);
  } catch {
    throw new Error("Choose a Little Links JSON backup.");
  }
  if (!backup || backup.version !== 1 || !Array.isArray(backup.links)) {
    throw new Error("This isn't a supported Little Links backup.");
  }

  const links = readLinks(JSON.stringify(backup.links));
  if (links.length !== backup.links.length) {
    throw new Error("The backup has invalid or duplicate links. Nothing was imported.");
  }
  return links;
}

export function mergeLinks(existing, imported, createId = () => crypto.randomUUID()) {
  const urls = new Set(existing.map((link) => link.url));
  const ids = new Set(existing.map((link) => link.id));
  const added = [];

  for (const link of imported) {
    if (urls.has(link.url)) continue;
    const id = ids.has(link.id) ? createId() : link.id;
    if (typeof id !== "string" || !id || ids.has(id)) {
      throw new Error("Couldn't assign a unique ID. Try importing again.");
    }
    added.push({ ...link, id });
    urls.add(link.url);
    ids.add(id);
  }
  return [...added, ...existing];
}

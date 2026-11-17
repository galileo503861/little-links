import test from "node:test";
import assert from "node:assert/strict";
import { tidyUrl, addLink, readLinks } from "../links.js";

const entry = { id: "first", title: "A useful article", url: "example.com/article", read: false, createdAt: 100 };

test("plain addresses get https and browser URL normalization", () => {
  assert.equal(tidyUrl("  EXAMPLE.com  "), "https://example.com/");
  assert.equal(tidyUrl("http://example.com/a#section"), "http://example.com/a#section");
});

test("non-web URLs and embedded passwords are rejected", () => {
  for (const url of ["", "https://", "javascript:alert(1)", "data:text/html,hi", "file:///tmp/a", "https://user:secret@example.com"]) {
    assert.throws(() => tidyUrl(url));
  }
});

test("duplicate links are caught after normalization", () => {
  const saved = addLink([], { ...entry, url: "https://example.com" });
  assert.throws(() => addLink(saved, { ...entry, id: "second", url: "https://example.com/" }), /already/);
});

test("a blank label uses the hostname", () => {
  const [saved] = addLink([], { ...entry, title: "  ", url: "https://www.example.com/a" });
  assert.equal(saved.title, "example.com");
});

test("bad storage does not stop the app, and valid entries survive", () => {
  assert.deepEqual(readLinks("broken json"), []);
  assert.deepEqual(readLinks(null), []);
  const saved = { ...entry, url: "https://example.com/article" };
  assert.deepEqual(readLinks(JSON.stringify([null, saved, saved, { ...saved, id: "bad", url: "javascript:alert(1)" }])), [saved]);
  assert.deepEqual(readLinks(JSON.stringify({ links: [saved] })), []);
});

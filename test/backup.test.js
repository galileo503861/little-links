import test from "node:test";
import assert from "node:assert/strict";
import { makeBackup, parseBackup, mergeLinks } from "../backup.js";

const first = { id: "first", title: "Tea notes", url: "https://example.com/tea", read: true, createdAt: 100 };
const second = { id: "second", title: "Dinner ideas", url: "https://recipes.test/pasta", read: false, createdAt: 200 };

test("a backup round trip preserves labels, order, read state and dates", () => {
  assert.deepEqual(parseBackup(makeBackup([second, first])), [second, first]);
  assert.deepEqual(parseBackup(makeBackup([])), []);
});

test("malformed files and unsupported formats are rejected", () => {
  for (const raw of ["not json", "null", "[]", '{"version":2,"links":[]}', '{"version":1,"links":{}}']) {
    assert.throws(() => parseBackup(raw));
  }
});

test("a bad entry rejects the whole backup instead of silently losing data", () => {
  const invalidEntries = [null, { ...second, read: "no" }, { ...second, url: "javascript:alert(1)" }, { ...second, createdAt: null }];
  for (const invalid of invalidEntries) {
    assert.throws(() => parseBackup(makeBackup([first, invalid])), /Nothing was imported/);
  }
  assert.throws(() => parseBackup(makeBackup([first, { ...second, id: first.id }])), /duplicate/);
  assert.throws(() => parseBackup(makeBackup([first, { ...second, url: first.url }])), /duplicate/);
});

test("merging skips normalized duplicate URLs and keeps existing edits", () => {
  const imported = parseBackup(makeBackup([{ ...first, title: "An old label", url: "https://EXAMPLE.com/tea", read: false }, second]));
  assert.deepEqual(mergeLinks([first], imported), [second, first]);
  assert.deepEqual(mergeLinks([first], [first]), [first]);
});

test("distinct links with the same ID survive a merge without mutating either list", () => {
  const imported = { ...second, id: first.id };
  const merged = mergeLinks([first], [imported], () => "replacement");
  assert.deepEqual(merged, [{ ...second, id: "replacement" }, first]);
  assert.equal(imported.id, first.id);
  assert.throws(() => mergeLinks([first], [imported], () => first.id), /unique ID/);
});

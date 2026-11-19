# Little Links

A reading list for links that would otherwise sit in an open tab forever.

Add a URL and an optional label, mark things as read, filter the list, or clear the links you've finished. The list is saved in this browser's local storage. It doesn't sync between devices.

Search by label or URL. Search works with the All, Unread and Read filters.

## Backups

Export JSON downloads the whole list, including read status, as `little-links.json`. Import JSON merges a backup into the current list without replacing existing links. Duplicate URLs keep the version already in this browser.

Imports accept this app's version 1 backups up to 1 MB. Invalid files are rejected before changing the list. Keep a backup if you want to move to another browser or clear your browser data.

## Run

No install or build step. Start a local server in this folder:

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000. A server is needed for the JavaScript module imports.

## Tests

Requires Node 20 or newer:

```sh
npm test
```

The tests cover URL handling, duplicates, search filters, damaged saved data, backup validation and merging lists. The page uses text nodes for saved labels and only accepts HTTP/HTTPS links.

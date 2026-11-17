# Little Links

A reading list for links that would otherwise sit in an open tab forever.

Add a URL and an optional label, mark things as read, filter the list, or clear the links you've finished. The list is saved in this browser's local storage. It doesn't sync between devices.

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

The tests cover URL handling, duplicate links and loading damaged saved data. The page uses text nodes for saved labels and only accepts HTTP/HTTPS links.

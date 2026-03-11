# CLAUDE.md

## Project overview

Lichess Chat Translator — a Chrome extension (Manifest V3) that translates chat messages on lichess.org using Chrome's built-in Translator API.

## Architecture

- **No build step.** Plain JS, CSS, loaded directly as an unpacked extension.
- Single content script (`content.js`) injected on all `lichess.org` pages.
- Uses Chrome's `Translator` API (Chrome 138+) — no external translation services or API keys.

## Key files

- `manifest.json` — MV3 manifest, defines content script injection
- `content.js` — All logic: DOM observation, UI injection, translation
- `styles.css` — Styling for the translator controls
- `README.md` — User-facing docs

## Important patterns

- **Chat detection:** Uses both `MutationObserver` and polling (`setInterval`) to reliably detect `.mchat ol.mchat__messages` appearing in the DOM.
- **Translator caching:** `getTranslator(source, target)` caches instances keyed by `${source}-${target}`. Cache is cleared when language dropdowns change.
- **Outgoing interception:** Captures Enter keydown in capture phase, translates, then re-dispatches Enter with a `skipNext` flag to avoid infinite loop.
- **Incoming translation:** Marks translated `<li>` elements with `data-translated="1"` to avoid re-translating. Original text stored in `title` attribute.

## Lichess DOM structure

- Chat container: `.mchat`
- Message list: `ol.mchat__messages`
- Individual messages: `<li>` (`.me` class = own messages)
- Message text: `<t>` element inside `<li>`
- Chat input: `input.mchat__say`

## Testing

1. Load unpacked at `chrome://extensions`
2. Open a Lichess game with chat
3. After code changes: reload extension, then refresh the Lichess tab

## Command to add opponent message to chat

`document.querySelector('ol.mchat__messages').insertAdjacentHTML('beforeend', '<li><a>opponent</a><t>Bonne chance dans le jeu</t></li>');`

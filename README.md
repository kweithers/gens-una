# Lichess Chat Translator

A Chrome extension that translates incoming and outgoing chat messages during Lichess games using Chrome's built-in [Translator API](https://developer.chrome.com/docs/ai/translator-api).

<img src="gens-una.gif" alt="Lichess Chat Translator demo" width="400">

## Requirements

- Chrome 138+

## Install

1. Go to `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked** and select this folder

## Usage

Open any Lichess game with chat. Two language dropdowns appear above the chat:

- **My** — your language (default: English). Incoming messages are translated into this.
- **Theirs** — opponent's language (default: Spanish). Your outgoing messages are translated into this.

Hover over a translated incoming message to see the original text.

## Files

| File | Purpose |
|------|---------|
| `manifest.json` | Extension manifest (MV3) |
| `content.js` | Translation logic, DOM injection, chat observation |
| `styles.css` | Styling for language selector controls |

## How it works

- A `MutationObserver` watches the chat `<ol>` for new messages
- Incoming opponent messages (non-`.me` `<li>` elements) are translated automatically
- Outgoing messages are intercepted on Enter keypress, translated, then sent
- Translator instances are cached and cleared when language selections change

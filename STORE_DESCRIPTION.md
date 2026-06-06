# Chrome Web Store Listing

## Short description (132 chars max)

Translates incoming and outgoing Lichess chat messages using Chrome's built-in Translator API.

## Detailed description

Lichess Chat Translator lets you play chess with anyone, regardless of language barrier. It automatically translates your opponent's messages into your language, and translates your messages into theirs — all in real time, right inside the Lichess chat.

**How it works**

When your opponent sends a message, the original text is shown alongside a translation in parentheses. When you type a message and hit Enter, it's automatically translated before being sent. Your original text is shown alongside the sent message so you always know what was said.

The extension uses Chrome's built-in Translator and Language Detector APIs, which run entirely on your device. No data is sent to external servers, and no API key is required.

**Features**

- Auto-detects your opponent's language from their first message
- Translates incoming messages inline, preserving the original text
- Translates outgoing messages before sending, showing your original text
- Language dropdowns let you manually set your language and your opponent's
- Toggle translation on/off at any time
- Supports 15 languages: English, Spanish, French, German, Portuguese, Russian, Chinese, Japanese, Korean, Arabic, Hindi, Italian, Dutch, Polish, Turkish

**Requirements**

- Chrome 138 or later
- Chrome's built-in Translation API must be enabled. If the extension shows a warning, visit `chrome://flags/#translation-api` and enable it, then relaunch Chrome.

**Privacy**

All translation happens locally on your device. No chat text or personal data ever leaves your browser. See the full privacy policy in the GitHub repository.

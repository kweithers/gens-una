(() => {
  const LANGUAGES = [
    ['en', 'English'], ['es', 'Spanish'], ['fr', 'French'], ['de', 'German'],
    ['pt', 'Portuguese'], ['ru', 'Russian'], ['zh', 'Chinese'], ['ja', 'Japanese'],
    ['ko', 'Korean'], ['ar', 'Arabic'], ['hi', 'Hindi'], ['it', 'Italian'],
    ['nl', 'Dutch'], ['pl', 'Polish'], ['tr', 'Turkish'],
  ];

  let myLang = 'en';
  let theirLang = 'es';
  const translatorCache = {};

  async function getTranslator(source, target) {
    if (source === target) return null;
    const key = `${source}-${target}`;
    if (!translatorCache[key]) {
      translatorCache[key] = await Translator.create({ sourceLanguage: source, targetLanguage: target });
    }
    return translatorCache[key];
  }

  function clearCache() {
    for (const key of Object.keys(translatorCache)) {
      delete translatorCache[key];
    }
  }

  function buildSelect(id, defaultVal, labelText) {
    const label = document.createElement('label');
    label.textContent = labelText + ' ';
    const select = document.createElement('select');
    select.id = id;
    for (const [code, name] of LANGUAGES) {
      const opt = document.createElement('option');
      opt.value = code;
      opt.textContent = name;
      if (code === defaultVal) opt.selected = true;
      select.appendChild(opt);
    }
    label.appendChild(select);
    return { label, select };
  }

  // --- Language detection ---

  let detector = null;

  async function getDetector() {
    if (!detector) {
      detector = await LanguageDetector.create();
    }
    return detector;
  }

  // --- Incoming translation ---

  async function translateIncoming(li) {
    const tEl = li.querySelector('t');
    if (!tEl || li.dataset.translated) return;
    li.dataset.translated = '1';
    const original = tEl.textContent;
    try {
      const det = await getDetector();
      const results = await det.detect(original);
      const sourceLang = results[0]?.detectedLanguage;
      if (!sourceLang || sourceLang === myLang) return;
      if (sourceLang !== theirLang) {
        theirLang = sourceLang;
        const theirSelect = document.getElementById('translator-their-lang');
        if (theirSelect) theirSelect.value = sourceLang;
        clearCache();
      }
      const translator = await getTranslator(sourceLang, myLang);
      if (!translator) return;
      const translated = await translator.translate(original);
      tEl.textContent = translated;
      tEl.title = original;
    } catch (e) {
      console.error('[Lichess Translator] incoming error:', e);
    }
  }

  function observeChat(chatOl) {
    // Translate existing opponent messages
    for (const li of chatOl.querySelectorAll('li:not(.me)')) {
      translateIncoming(li);
    }
    // Watch for new messages
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType === 1 && node.tagName === 'LI' && !node.classList.contains('me')) {
            translateIncoming(node);
          }
        }
      }
    });
    observer.observe(chatOl, { childList: true });
  }

  // --- Outgoing translation ---

  function setupOutgoing(chatContainer) {
    const input = chatContainer.querySelector('input.mchat__say') || chatContainer.querySelector('input[type="text"]');
    if (!input) return;
    let skipNext = false;

    input.addEventListener('keydown', async (e) => {
      if (e.key !== 'Enter') return;
      if (skipNext) { skipNext = false; return; } // let this one through to Lichess
      if (!input.value.trim()) return;

      e.stopImmediatePropagation();
      e.preventDefault();

      try {
        const translator = await getTranslator(myLang, theirLang);
        if (translator) {
          input.value = await translator.translate(input.value);
        }
      } catch (err) {
        console.error('[Lichess Translator] outgoing error:', err);
      }

      // Re-dispatch Enter and let it pass through to Lichess
      skipNext = true;
      input.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true,
      }));
    }, true); // capture phase to intercept before Lichess
  }

  // --- Init ---

  function init() {
    const chatContainer = document.querySelector('.mchat');
    if (!chatContainer) return;

    const chatOl = chatContainer.querySelector('ol.mchat__messages');
    if (!chatOl) return;

    // Check API availability
    if (!('Translator' in self) || !('LanguageDetector' in self)) {
      const warn = document.createElement('div');
      warn.className = 'translator-warning';
      warn.textContent = 'Translator/LanguageDetector API unavailable. Requires Chrome 138+.';
      chatOl.parentNode.insertBefore(warn, chatOl);
      return;
    }

    // Build controls
    const controls = document.createElement('div');
    controls.className = 'translator-controls';

    const my = buildSelect('translator-my-lang', myLang, 'My:');
    const their = buildSelect('translator-their-lang', theirLang, 'Theirs:');

    my.select.addEventListener('change', () => { myLang = my.select.value; clearCache(); });
    their.select.addEventListener('change', () => { theirLang = their.select.value; clearCache(); });

    controls.appendChild(my.label);
    controls.appendChild(their.label);
    chatOl.parentNode.insertBefore(controls, chatOl);

    // Start observing
    observeChat(chatOl);
    setupOutgoing(chatContainer);
  }

  // Wait for chat OL to appear — poll + observe for reliability
  let initialized = false;

  function tryInit() {
    if (initialized) return;
    if (document.querySelector('.mchat ol.mchat__messages')) {
      initialized = true;
      init();
    }
  }

  tryInit();

  const bodyObserver = new MutationObserver(tryInit);
  bodyObserver.observe(document.body, { childList: true, subtree: true });

  // Polling fallback in case MutationObserver misses it
  const poll = setInterval(() => {
    tryInit();
    if (initialized) clearInterval(poll);
  }, 500);
})();

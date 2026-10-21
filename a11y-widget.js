// Accessibility settings: the round button with the accessibility symbol on
// every page. It offers optional display preferences on top of a site that
// already meets WCAG 2.1 AA, and changes nothing for visitors who don't use it:
// screen readers, keyboard and browser zoom work the same with or without it.
// Choices are kept in this browser only (localStorage "gtc-a11y"); the snippet
// in each page's <head> applies them before the page is drawn, as data-a11y-*
// attributes on <html> that a11y-widget.css acts on.
const strings = {
  en: {
    title: 'Accessibility settings',
    close: 'Close',
    size: 'Text size',
    contrast: 'High contrast',
    links: 'Highlight links',
    readable: 'Readable font',
    cursor: 'Large cursor',
    read: 'Read aloud',
    reset: 'Reset settings',
    note: 'The site also works with your own screen reader, keyboard and browser zoom.',
    statement: 'Accessibility statement',
    statementUrl: '/accessibility.html',
  },
  el: {
    title: 'Ρυθμίσεις προσβασιμότητας',
    close: 'Κλείσιμο',
    size: 'Μέγεθος κειμένου',
    contrast: 'Υψηλή αντίθεση',
    links: 'Επισήμανση συνδέσμων',
    readable: 'Ευανάγνωστη γραμματοσειρά',
    cursor: 'Μεγάλος δείκτης',
    read: 'Ανάγνωση φωναχτά',
    reset: 'Επαναφορά',
    note: 'Ο ιστότοπος λειτουργεί επίσης με το δικό σας πρόγραμμα ανάγνωσης οθόνης, το πληκτρολόγιο και τη μεγέθυνση του προγράμματος περιήγησης.',
    statement: 'Δήλωση προσβασιμότητας',
    statementUrl: '/el/accessibility.html',
  },
};
const root = document.documentElement;
const text = strings[root.lang] || strings.en;
const key = 'gtc-a11y';
const sizes = ['100', '125', '150', '200'];
const options = ['contrast', 'links', 'readable', 'cursor'];

const icon = paths => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths}</svg>`;
const icons = {
  access: icon('<circle cx="12" cy="12" r="10.5"/><circle cx="12" cy="6.4" r="1.7" class="fill"/><path d="M6.5 9.4 12 10.5l5.5-1.1M12 10.5v3.8m0 0-2.6 5m2.6-5 2.6 5"/>'),
  close: icon('<path d="M6 6l12 12M18 6 6 18"/>'),
  contrast: icon('<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" class="fill"/>'),
  links: icon('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
  readable: icon('<path d="M2.5 19 7.5 5l5 14M4.3 14h6.4"/><circle cx="17.5" cy="15.5" r="3.5"/><path d="M21 12v7"/>'),
  cursor: icon('<path d="M5 3l14 8-6 1.6L9.8 19z"/>'),
  read: icon('<path d="M4 9h3l5-4v14l-5-4H4z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/>'),
};

const widget = document.createElement('div');
widget.className = 'a11y-widget';
widget.innerHTML = `
  <button type="button" class="a11y-toggle" aria-expanded="false" aria-controls="a11y-panel" aria-label="${text.title}">${icons.access}</button>
  <section class="a11y-panel" id="a11y-panel" aria-labelledby="a11y-title" hidden>
    <div class="a11y-head">
      <h2 id="a11y-title">${text.title}</h2>
      <button type="button" class="a11y-close" aria-label="${text.close}">${icons.close}</button>
    </div>
    <fieldset class="a11y-size">
      <legend>${text.size}</legend>
      <div>${sizes.map(size => `<label><input type="radio" name="a11y-size" value="${size}"><span>${size}%</span></label>`).join('')}</div>
    </fieldset>
    <div class="a11y-options">
      ${options.map(option => `<button type="button" class="a11y-option" data-option="${option}" aria-pressed="false">${icons[option]}<span>${text[option]}</span></button>`).join('')}
      <button type="button" class="a11y-option a11y-read" aria-pressed="false">${icons.read}<span>${text.read}</span></button>
    </div>
    <button type="button" class="a11y-reset">${text.reset}</button>
    <p class="a11y-note">${text.note} <a href="${text.statementUrl}">${text.statement}</a></p>
  </section>`;
// Right after the skip link: the second stop for keyboard users on every page.
document.querySelector('.skip-link').after(widget);
const toggle = widget.querySelector('.a11y-toggle');
const panel = widget.querySelector('.a11y-panel');

// --- Preferences ---
let settings = {};
try { settings = JSON.parse(localStorage.getItem(key)) || {}; } catch {}
const apply = () => {
  if (!sizes.includes(settings.text) || settings.text === '100') delete settings.text;
  options.forEach(option => { if (settings[option] !== 'on') delete settings[option]; });
  ['text', ...options].forEach(name => {
    if (settings[name]) root.setAttribute(`data-a11y-${name}`, settings[name]);
    else root.removeAttribute(`data-a11y-${name}`);
  });
  widget.querySelectorAll('[name="a11y-size"]').forEach(input => { input.checked = input.value === (settings.text || '100'); });
  widget.querySelectorAll('[data-option]').forEach(button =>
    button.setAttribute('aria-pressed', String(Boolean(settings[button.dataset.option]))));
  try {
    if (Object.keys(settings).length) localStorage.setItem(key, JSON.stringify(settings));
    else localStorage.removeItem(key);
  } catch {}
};
widget.querySelectorAll('[name="a11y-size"]').forEach(input =>
  input.addEventListener('change', () => { settings.text = input.value; apply(); }));
widget.querySelectorAll('[data-option]').forEach(button => button.addEventListener('click', () => {
  settings[button.dataset.option] = settings[button.dataset.option] ? '' : 'on';
  apply();
}));
apply();

// --- Read aloud, with the device's own voice for the page language ---
// One utterance per heading, paragraph or list item: Chrome cuts long ones off.
// Selected text, if any, is read instead of the whole page.
const speech = window.speechSynthesis;
const readButton = widget.querySelector('.a11y-read');
let session = 0;
let reading = null;
const mark = element => {
  reading?.classList.remove('a11y-reading');
  reading = element;
  reading?.classList.add('a11y-reading');
  reading?.scrollIntoView({ block: 'nearest' });
};
const stopReading = () => {
  session++;
  speech.cancel();
  mark(null);
  readButton.setAttribute('aria-pressed', 'false');
};
const blocks = () => {
  const selected = getSelection().toString().trim();
  if (selected) return [{ text: selected }];
  const found = [...document.querySelectorAll('main :is(h1, h2, h3, p, li, label)')];
  return found
    .filter(element => element.checkVisibility() && !found.some(other => other !== element && element.contains(other)))
    .map(element => ({ element, text: element.innerText.trim() }))
    .filter(block => block.text);
};
const speak = (queue, id) => {
  if (id !== session) return;
  const block = queue.shift();
  if (!block) return stopReading();
  mark(block.element || null);
  const utterance = new SpeechSynthesisUtterance(block.text);
  utterance.lang = root.lang;
  utterance.voice = speech.getVoices().find(voice => voice.lang.toLowerCase().startsWith(root.lang)) || null;
  utterance.onend = () => speak(queue, id);
  utterance.onerror = () => { if (id === session) stopReading(); };
  speech.speak(utterance);
};
if (speech) {
  speech.getVoices(); // Chrome loads the voice list on first request.
  readButton.addEventListener('click', () => {
    if (readButton.getAttribute('aria-pressed') === 'true') return stopReading();
    stopReading();
    readButton.setAttribute('aria-pressed', 'true');
    speak(blocks(), session);
  });
  addEventListener('pagehide', () => speech.cancel());
} else readButton.hidden = true;

widget.querySelector('.a11y-reset').addEventListener('click', () => {
  if (speech) stopReading();
  settings = {};
  apply();
});

// --- Open and close: a disclosure, so the page stays usable beside it ---
const setOpen = (open, returnFocus) => {
  panel.hidden = !open;
  toggle.setAttribute('aria-expanded', String(open));
  if (!open && returnFocus) toggle.focus();
};
toggle.addEventListener('click', () => setOpen(panel.hidden));
widget.querySelector('.a11y-close').addEventListener('click', () => setOpen(false, true));
widget.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !panel.hidden) setOpen(false, true);
});
widget.addEventListener('focusout', event => {
  if (event.relatedTarget && !widget.contains(event.relatedTarget)) setOpen(false);
});
document.addEventListener('pointerdown', event => {
  if (!panel.hidden && !widget.contains(event.target)) setOpen(false);
});

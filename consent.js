// Cookie consent for Google Analytics (loaded through Google Tag Manager).
// The snippet at the top of each page's <head> sets Google's consent defaults
// to denied and only loads GTM once the visitor has accepted ("basic" consent
// mode). This file asks the question, stores the answer and lets the visitor
// change it from the "Cookie settings" button in the footer.
const strings = {
  en: {
    title: 'Cookies',
    text: 'With your consent, we use Google Analytics cookies to see how our website is used. You can change your choice at any time in “Cookie settings”.',
    policy: 'Privacy policy',
    policyUrl: '/privacy.html',
    accept: 'Accept',
    reject: 'Reject',
    accepted: 'Your current choice: Google Analytics accepted.',
    rejected: 'Your current choice: Google Analytics rejected.',
  },
  el: {
    title: 'Cookies',
    text: 'Με τη συγκατάθεσή σας, χρησιμοποιούμε cookies του Google Analytics για να βλέπουμε πώς χρησιμοποιείται ο ιστότοπος. Μπορείτε να αλλάξετε την επιλογή σας οποιαδήποτε στιγμή από τις «Ρυθμίσεις cookies».',
    policy: 'Πολιτική απορρήτου',
    policyUrl: '/el/privacy.html',
    accept: 'Αποδοχή',
    reject: 'Απόρριψη',
    accepted: 'Η τρέχουσα επιλογή σας: αποδοχή του Google Analytics.',
    rejected: 'Η τρέχουσα επιλογή σας: απόρριψη του Google Analytics.',
  },
};
const text = strings[document.documentElement.lang] || strings.en;
const consent = window.gtcConsent;

const dialog = document.createElement('dialog');
dialog.className = 'consent-dialog';
dialog.setAttribute('aria-labelledby', 'consent-title');
dialog.setAttribute('aria-describedby', 'consent-text');
dialog.innerHTML = `
  <h2 id="consent-title" tabindex="-1">${text.title}</h2>
  <p id="consent-text">${text.text} <a href="${text.policyUrl}">${text.policy}</a></p>
  <p class="consent-current" hidden></p>
  <div class="consent-actions">
    <button type="button" value="accept">${text.accept}</button>
    <button type="button" value="reject">${text.reject}</button>
  </div>`;
document.body.append(dialog);
const current = dialog.querySelector('.consent-current');

// Google Analytics sets its cookies on the site's domain and its parents
// (e.g. .thegrowthcubes.com); remove them from each when consent is withdrawn.
const clearAnalyticsCookies = () => {
  const host = location.hostname.split('.');
  document.cookie.split('; ').map(cookie => cookie.split('=')[0]).filter(name => name.startsWith('_ga')).forEach(name => {
    document.cookie = `${name}=; Max-Age=0; path=/`;
    for (let i = 0; i < host.length - 1; i++)
      document.cookie = `${name}=; Max-Age=0; path=/; domain=.${host.slice(i).join('.')}`;
  });
};

// A first visit must end with a choice: Escape cannot dismiss the dialog then.
let required = false;
const open = isRequired => {
  required = isRequired;
  const choice = consent.read();
  current.hidden = !choice;
  if (choice) current.textContent = choice.analytics ? text.accepted : text.rejected;
  dialog.showModal();
  dialog.querySelector('h2').focus();
};
const save = analytics => {
  try { localStorage.setItem(consent.key, JSON.stringify({ analytics, date: Date.now() })); } catch {}
  if (analytics) consent.loadGtm();
  else {
    gtag('consent', 'update', { analytics_storage: 'denied' });
    clearAnalyticsCookies();
  }
  required = false;
  dialog.close();
};
dialog.querySelectorAll('.consent-actions button').forEach(button =>
  button.addEventListener('click', () => save(button.value === 'accept')));
dialog.addEventListener('cancel', event => { if (required) event.preventDefault(); });
// Some browsers close a modal on a repeated Escape regardless; ask again.
dialog.addEventListener('close', () => { if (required) open(true); });

document.querySelectorAll('.consent-settings').forEach(button => {
  button.hidden = false;
  button.addEventListener('click', () => open(false));
});
// The privacy policy itself stays readable before a choice is made.
if (!consent.read() && document.body.dataset.consentPrompt !== 'off') open(true);

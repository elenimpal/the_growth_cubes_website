// Cookiebot is deployed through GTM and owns the banner and consent storage.
// This bridge only connects the footer button to Cookiebot's settings dialog.
const buttons = document.querySelectorAll('.consent-settings');
const showSettings = () => {
  if (typeof window.Cookiebot?.renew !== 'function') return;
  buttons.forEach(button => { button.hidden = false; });
};

buttons.forEach(button => {
  button.addEventListener('click', () => window.Cookiebot?.renew());
});
window.addEventListener('CookiebotOnConsentReady', showSettings);
window.addEventListener('CookiebotOnLoad', showSettings);
showSettings();

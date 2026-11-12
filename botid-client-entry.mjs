import { initBotId } from 'botid/client/core';

// Protect only the contact form POST using free Basic verification.
initBotId({
  protect: [{ path: '/api/contact', method: 'POST', advancedOptions: { checkLevel: 'basic' } }]
});

import { initBotId } from 'botid/client/core';

// Only protect the direct inquiry endpoint, at the free Basic level.
initBotId({
  protect: [{
    path: '/api/contact',
    method: 'POST',
    advancedOptions: { checkLevel: 'basic' }
  }]
});

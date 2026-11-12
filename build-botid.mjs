import { build } from 'esbuild';

// Bundle only BotID bootstrap for browser. Leave site HTML/CSS/JS unchanged.
await build({
  entryPoints: ['botid-client-entry.mjs'],
  outfile: 'botid-client.js',
  bundle: true,
  minify: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2022',
  logLevel: 'info'
});

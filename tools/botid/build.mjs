import { build } from 'esbuild';

// Bundle only BotID bootstrap. All existing HTML, CSS and other JS remain static.
await build({
  entryPoints: ['tools/botid/client-entry.mjs'],
  outfile: 'botid-client.js',
  bundle: true,
  minify: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2022',
  logLevel: 'info'
});

import { build } from 'esbuild-wasm';

// Bundle only the BotID browser bootstrap. Leave all other site assets untouched.
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

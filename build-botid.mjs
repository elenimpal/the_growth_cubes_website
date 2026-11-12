import { cpSync, mkdirSync } from 'node:fs';
import { build } from 'esbuild';

// Vercel requires an explicit static output directory when a custom build runs.
// Preserve the existing site's public assets byte-for-byte; only BotID is bundled.
mkdirSync('public', { recursive: true });
for (const asset of [
  'index.html', 'accessibility.html', 'privacy.html',
  'styles.css', 'accessibility.css', 'a11y-widget.css', 'consent.css',
  'a11y-widget.js', 'consent.js', 'forms.js',
  'favicon.svg', 'growth_cubes_hero.jpg', 'visual_id_ESPA.png',
  'el'
]) {
  cpSync(asset, `public/${asset}`, { recursive: true });
}

await build({
  entryPoints: ['botid-client-entry.mjs'],
  outfile: 'public/botid-client.js',
  bundle: true,
  minify: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2022',
  logLevel: 'info'
});

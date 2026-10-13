const fs = require("node:fs");
const hex = (s) => s.match(/\w\w/g).map((v) => parseInt(v, 16));
const mix = (fg, bg, a) => fg.map((c, i) => c * a + bg[i] * (1 - a));
const luminance = (c) =>
  c
    .map((x) => x / 255)
    .map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4))
    .reduce((sum, x, i) => sum + x * [0.2126, 0.7152, 0.0722][i], 0);
const ratio = (a, b) => {
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};
const ink = hex("35111b"),
  cream = hex("f4f0ea"),
  white = hex("ffffff");
const form = mix(ink, cream, 0.95);
const card = mix(cream, ink, 0.05);
const checks = [
  [
    "Hero text over brightest possible video frame",
    cream,
    mix(ink, white, 0.82),
    4.5,
  ],
  [
    "Footer text over brightest possible video frame",
    cream,
    mix(ink, white, 0.94),
    4.5,
  ],
  ["Reveal text", cream, ink, 4.5],
  ["Services body at 85% opacity", mix(cream, ink, 0.85), ink, 4.5],
  ["Timeline body at 90% opacity", mix(cream, card, 0.9), card, 4.5],
  ["Timeline step numbers", hex("dfb8c1"), card, 4.5],
  ["Contact placeholders", hex("cdbdc1"), form, 4.5],
  ["Contact input boundary", hex("b9828e"), form, 3],
  ["Newsletter placeholders", hex("595959"), white, 4.5],
  ["Focus white ring against burgundy", white, ink, 3],
  ["Focus burgundy outer ring against cream", ink, cream, 3],
].map(([name, foreground, background, minimum]) => ({
  name,
  foreground,
  background,
  minimum,
  ratio: ratio(foreground, background),
  pass: ratio(foreground, background) >= minimum,
}));
fs.writeFileSync(
  "docs/accessibility/reports/contrast-bounds.json",
  JSON.stringify(
    {
      timestamp: new Date().toISOString(),
      method:
        "WCAG sRGB relative luminance; conservative white video frame; source CSS colors and alpha compositing. Does not validate pixel-level overlap, mask compositing, hover spotlight, or every animated state.",
      checks,
    },
    null,
    2
  )
);
console.log(
  checks
    .map((c) => `${c.name}: ${c.ratio.toFixed(2)} ${c.pass ? "PASS" : "FAIL"}`)
    .join("\n")
);
if (checks.some((c) => !c.pass)) process.exitCode = 1;

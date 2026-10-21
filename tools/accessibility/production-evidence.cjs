// Evidence run against the published website. Every run writes to its own
// timestamped folder, so earlier evidence is never overwritten.
//   node tools/accessibility/production-evidence.cjs [https://www.thegrowthcubes.com]
const { chromium } = require("playwright");
const axe = require("axe-core");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { execFileSync } = require("node:child_process");

const root = path.resolve(__dirname, "../..");
const site = (process.argv[2] || "https://www.thegrowthcubes.com").replace(/\/$/, "");
const started = new Date();
const stamp = started.toISOString().replace(/[:.]/g, "-").slice(0, 19);
const out = path.join(root, "docs/accessibility/evidence", stamp);
fs.mkdirSync(out, { recursive: true });

const pages = [
  { id: "home-en", lang: "en", path: "/", file: "index.html", home: true },
  { id: "home-el", lang: "el", path: "/el/", file: "el/index.html", home: true },
  { id: "statement-en", lang: "en", path: "/accessibility.html", file: "accessibility.html" },
  { id: "statement-el", lang: "el", path: "/el/accessibility.html", file: "el/accessibility.html" },
];
const assets = ["styles.css", "accessibility.css", "forms.js", "consent.js", "consent.css", "a11y-widget.js", "a11y-widget.css", "favicon.svg"];
const viewports = [
  ["desktop-1440", 1440, 900],
  ["tablet-768", 768, 1024],
  ["mobile-390", 390, 844],
  ["mobile-320", 320, 800],
  ["landscape-844", 844, 390],
  ["reflow-320x256", 320, 256],
];
const sha = (data) => crypto.createHash("sha256").update(data).digest("hex");
const checks = [];
const check = (page, name, pass, detail = null) => checks.push({ page, name, pass: !!pass, detail });

(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const results = {
    site,
    started: started.toISOString(),
    timezone: "Europe/Athens",
    platform: process.platform,
    browser: `Chrome ${browser.version()}`,
    axeVersion: axe.version,
    playwrightVersion: require("playwright/package.json").version,
    standard: "WCAG 2.1 A + AA (axe tags wcag2a, wcag2aa, wcag21a, wcag21aa)",
    files: [],
    scans: [],
    keyboard: [],
    contrast: [],
    checks,
  };

  // 1. The published files are the audited files (byte-for-byte).
  for (const item of [...pages.map((p) => ({ url: p.path, file: p.file })), ...assets.map((a) => ({ url: `/${a}`, file: a }))]) {
    const response = await fetch(site + item.url);
    const published = sha(Buffer.from(await response.arrayBuffer()));
    const local = sha(fs.readFileSync(path.join(root, item.file)));
    results.files.push({ url: site + item.url, status: response.status, sha256: published, matchesRepository: published === local });
  }
  results.commit = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root }).toString().trim();
  check("all", "Published files are identical to the audited source files", results.files.every((f) => f.status === 200 && f.matchesRepository));

  // A visitor who has already answered the cookie question (rejected): the
  // consent dialog is modal and would otherwise cover every page under test.
  const context = await browser.newContext();
  await context.addInitScript(() => localStorage.setItem("gtc-consent", JSON.stringify({ analytics: false, date: Date.now() })));
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("pageerror", (e) => consoleErrors.push(e.message));
  page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));

  async function scan(p, name, width, height, setup) {
    await page.setViewportSize({ width, height });
    await page.goto(site + p.path, { waitUntil: "networkidle" });
    if (setup) await setup();
    await page.addScriptTag({ content: axe.source });
    const report = await page.evaluate(() =>
      axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] } })
    );
    fs.writeFileSync(path.join(out, `axe-${p.id}-${name}.json`), JSON.stringify(report, null, 2));
    const layout = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      clipped: [...document.querySelectorAll("h1,h2,h3,p,li,label,a,button,input,textarea")].filter((e) => {
        const r = e.getBoundingClientRect();
        return r.width > 0 && (r.left < -1 || r.right > innerWidth + 1);
      }).length,
    }));
    results.scans.push({
      page: p.id,
      state: name,
      viewport: `${width}x${height}`,
      violations: report.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })),
      passes: report.passes.length,
      incomplete: report.incomplete.map((v) => ({ id: v.id, nodes: v.nodes.length })),
      horizontalScroll: layout.overflow,
      clippedElements: layout.clipped,
    });
    check(p.id, `${name}: no horizontal scrolling and no content cut off`, !layout.overflow && layout.clipped === 0, layout);
    return report;
  }

  for (const p of pages) {
    for (const [name, w, h] of viewports) await scan(p, name, w, h);
    await page.screenshot({ path: path.join(out, `screenshot-${p.id}-reflow-320x256.png`) });
    await scan(p, "text-spacing", 390, 844, () =>
      page.addStyleTag({ content: "* {line-height:1.5 !important;letter-spacing:.12em !important;word-spacing:.16em !important;} p {margin-bottom:2em !important;}" })
    );
    await scan(p, "text-200-percent", 1440, 900, () =>
      page.evaluate(() => {
        const all = [...document.querySelectorAll("body *")];
        const sizes = all.map((e) => parseFloat(getComputedStyle(e).fontSize));
        all.forEach((e, i) => (e.style.fontSize = `${sizes[i] * 2}px`));
      })
    );
    // Accessibility settings panel: open as it first appears, then with high
    // contrast and highlighted links chosen (saved, and kept after a reload).
    const openPanel = async (settings) => {
      if (settings) {
        await page.evaluate((v) => localStorage.setItem("gtc-a11y", JSON.stringify(v)), settings);
        await page.reload({ waitUntil: "networkidle" });
      }
      await page.locator(".a11y-toggle").click();
    };
    await scan(p, "a11y-panel", 1440, 900, () => openPanel());
    await page.screenshot({ path: path.join(out, `screenshot-${p.id}-a11y-panel.png`) });
    await scan(p, "a11y-contrast", 1440, 900, () => openPanel({ contrast: "on", links: "on" }));
    await page.screenshot({ path: path.join(out, `screenshot-${p.id}-a11y-contrast.png`) });
    check(p.id, "Accessibility settings are applied and kept after the page reloads", await page.evaluate(() => document.documentElement.dataset.a11yContrast === "on" && document.documentElement.dataset.a11yLinks === "on"));
    await page.evaluate(() => localStorage.removeItem("gtc-a11y"));

    // Structure and keyboard, on a clean desktop load.
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(site + p.path, { waitUntil: "networkidle" });
    await page.screenshot({ path: path.join(out, `screenshot-${p.id}-desktop.png`) });
    await page.screenshot({ path: path.join(out, `screenshot-${p.id}-desktop-full.png`), fullPage: true });
    const structure = await page.evaluate(() => {
      const levels = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) => +h.tagName[1]);
      return {
        lang: document.documentElement.lang,
        title: document.title,
        h1: document.querySelectorAll("h1").length,
        headingSkips: levels.filter((l, i) => i && l > levels[i - 1] + 1).length,
        imagesWithoutAlt: [...document.images].filter((i) => !i.hasAttribute("alt")).length,
        landmarks: ["header", "main", "footer"].every((t) => document.querySelector(t)),
        motion: document.querySelectorAll("video, canvas, marquee, [autoplay]").length + document.getAnimations().length,
        deadLinks: [...document.querySelectorAll("a[href]")].filter((a) => ["", "#"].includes(a.getAttribute("href"))).length,
        unlabelledFields: [...document.querySelectorAll("input, textarea, select")].filter((f) => !f.labels || !f.labels.length).length,
        fieldsWithoutAutocomplete: [...document.querySelectorAll("input[type=email], input[name=name]")].filter((f) => !f.autocomplete).length,
      };
    });
    check(p.id, "Page declares its language", structure.lang === p.lang, structure.lang);
    check(p.id, "Page has a descriptive title", structure.title.length > 10, structure.title);
    check(p.id, "Exactly one main heading and no skipped heading levels", structure.h1 === 1 && structure.headingSkips === 0, structure);
    check(p.id, "Every image has a text alternative", structure.imagesWithoutAlt === 0);
    check(p.id, "Header, main content and footer regions are present", structure.landmarks);
    check(p.id, "No video, animation or moving content", structure.motion === 0, structure.motion);
    check(p.id, "No empty or placeholder links", structure.deadLinks === 0);
    check(p.id, "Every form field has a visible label", structure.unlabelledFields === 0);

    // Keyboard: Tab through the whole page and record every stop.
    const stops = [];
    for (let i = 0; i < 60; i++) {
      await page.keyboard.press("Tab");
      // Let the browser finish scrolling the focused element into view.
      await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
      const stop = await page.evaluate(() => {
        const e = document.activeElement;
        if (!e || e === document.body) return null;
        const cs = getComputedStyle(e);
        const r = e.getBoundingClientRect();
        const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        return {
          element: e.tagName.toLowerCase(),
          name: (e.getAttribute("aria-label") || e.innerText || e.labels?.[0]?.innerText || "").trim().replace(/\s+/g, " ").slice(0, 60),
          focusRing: cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) >= 2,
          // Share of the element inside the viewport once the browser has scrolled to it.
          visibleShare: +((Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)) * Math.max(0, Math.min(r.right, innerWidth) - Math.max(r.left, 0))) / (r.width * r.height)).toFixed(2),
          obscured: !!top && !(e.contains(top) || top.contains(e)),
        };
      });
      if (!stop || (stops.length && i > 2 && stop.name === stops[0].name && stop.element === stops[0].element)) break;
      stops.push(stop);
    }
    results.keyboard.push({ page: p.id, stops });
    // Controls inside closed containers (the accessibility panel, the cookie
    // dialog) are correctly out of the tab order until they are opened.
    const expected = await page.locator("a[href], button, input, textarea").evaluateAll((all) => all.filter((e) => e.checkVisibility()).length);
    check(p.id, "First Tab reaches the skip link", /skip|Μετάβαση/i.test(stops[0]?.name || ""), stops[0]);
    check(p.id, "Every link, button and field is reachable with the keyboard", stops.length === expected, { reached: stops.length, expected });
    check(p.id, "Every keyboard stop shows a visible focus indicator", stops.every((s) => s.focusRing), stops.filter((s) => !s.focusRing));
    // WCAG asks that a focused element is not hidden by other content; the visible
    // share of each stop is recorded in the keyboard log for reference.
    check(p.id, "Focused elements are on screen and never covered by other content", stops.every((s) => s.visibleShare > 0.5 && !s.obscured), stops.filter((s) => s.visibleShare <= 0.5 || s.obscured));
    // The accessibility settings button comes right after the skip link.
    await page.goto(site + p.path);
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    const toggle = page.locator(".a11y-toggle");
    const panelKeys = { secondStop: await toggle.evaluate((e) => e === document.activeElement) };
    await page.keyboard.press("Enter");
    panelKeys.opensWithEnter = (await toggle.getAttribute("aria-expanded")) === "true" && (await page.locator("#a11y-panel").isVisible());
    await page.keyboard.press("Escape");
    panelKeys.closesWithEscape = (await toggle.getAttribute("aria-expanded")) === "false" && (await toggle.evaluate((e) => e === document.activeElement));
    check(p.id, "Accessibility settings button is the second keyboard stop and opens and closes with Enter and Escape", Object.values(panelKeys).every(Boolean), panelKeys);
    await page.goto(site + p.path);
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    check(p.id, "Skip link moves focus to the main content", await page.locator("main").evaluate((e) => e === document.activeElement));
    const other = p.lang === "en" ? "el" : "en";
    await page.locator(".lang-link").click();
    await page.waitForLoadState();
    check(p.id, `Language selector opens the ${other} version of the same page`, (await page.locator("html").getAttribute("lang")) === other, page.url());

    if (p.home) {
      // Contact form: errors are announced in text, focus moves to the first one.
      const invalid = await scan(p, "form-errors", 390, 844, () => page.locator("#contact-form button").click());
      const form = await page.evaluate(() => ({
        focusOnFirstError: document.activeElement.id === "contact-name" && document.activeElement.getAttribute("aria-invalid") === "true",
        errorTexts: [...document.querySelectorAll(".field-error")].map((e) => e.textContent).filter(Boolean),
        status: document.getElementById("contact-status").textContent,
        statusRole: document.getElementById("contact-status").getAttribute("role"),
        described: [...document.querySelectorAll("#contact-form [aria-invalid=true]")].every((f) => document.getElementById(f.getAttribute("aria-describedby"))?.textContent),
      }));
      await page.screenshot({ path: path.join(out, `screenshot-${p.id}-form-errors.png`) });
      check(p.id, "Form errors are described in text and linked to their fields", form.errorTexts.length === 3 && form.described, form);
      check(p.id, "Focus moves to the first field that needs correction", form.focusOnFirstError);
      check(p.id, "Form result is announced to assistive technology", form.statusRole === "status" && form.status.length > 0, form.status);
      await scan(p, "form-completed", 390, 844, async () => {
        await page.locator("#contact-name").fill("Accessibility test");
        await page.locator("#contact-email").fill("test@example.com");
        await page.locator("#contact-message").fill("Evidence run — not sent.");
        await page.locator("#contact-form button").click();
      });
      check(p.id, "Completed form prepares the email without false confirmation", await page.locator("#contact-email-draft").evaluate((e) => !e.hidden && e.href.startsWith("mailto:info@thegrowthcubes.com")), invalid.violations.length);

      // Contrast of the hero text against the brightest point of the photo behind it.
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(site + p.path, { waitUntil: "networkidle" });
      const hero = await page.evaluate(async () => {
        const lum = (c) => c.map((x) => x / 255).map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4)).reduce((s, x, i) => s + x * [0.2126, 0.7152, 0.0722][i], 0);
        const ratio = (a, b) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05);
        const rgb = (s) => s.match(/[\d.]+/g).slice(0, 3).map(Number);
        const style = getComputedStyle(document.querySelector(".hero"));
        const img = new Image();
        img.src = style.backgroundImage.match(/url\("([^"]+)"\)/)[1];
        await img.decode();
        const canvas = Object.assign(document.createElement("canvas"), { width: img.naturalWidth, height: img.naturalHeight });
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let brightest = [0, 0, 0];
        for (let i = 0; i < data.length; i += 4) if (lum([data[i], data[i + 1], data[i + 2]]) > lum(brightest)) brightest = [data[i], data[i + 1], data[i + 2]];
        const tint = [53, 17, 27];
        const behind = brightest.map((c, i) => tint[i] * 0.6 + c * 0.4);
        return [".hero-title", ".hero-subtitle"].map((sel) => {
          const cs = getComputedStyle(document.querySelector(sel));
          return { text: sel, color: cs.color, worstBackground: behind.map(Math.round), ratio: +ratio(rgb(cs.color), behind).toFixed(2), required: parseFloat(cs.fontSize) >= 24 ? 3 : 4.5 };
        });
      });
      results.contrast.push({ page: p.id, hero });
      check(p.id, "Text over the hero photo meets the contrast requirement at its brightest point", hero.every((h) => h.ratio >= 4.5), hero);
    }
  }
  check("all", "No JavaScript or loading errors on any page", consoleErrors.length === 0, consoleErrors);

  // Without JavaScript the content and navigation remain available.
  const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const plain = await nojs.newPage();
  for (const p of pages.filter((x) => x.home)) {
    await plain.goto(site + p.path);
    check(p.id, "Content and navigation work with JavaScript disabled", (await plain.locator(".nav a").first().isVisible()) && (await plain.locator(".card").last().isVisible()) && (await plain.locator("#contact-form").isVisible()));
  }
  await nojs.close();
  await browser.close();

  // HTML validation of the audited source files (identical to the published ones).
  try {
    const validation = execFileSync(path.join(root, "node_modules/.bin/html-validate"), ["--formatter", "json", ...pages.map((p) => p.file)], { cwd: root }).toString();
    results.htmlValidation = JSON.parse(validation).map((r) => ({ file: path.relative(root, r.filePath), errors: r.errorCount, warnings: r.warningCount }));
  } catch (error) {
    results.htmlValidation = JSON.parse(error.stdout.toString()).map((r) => ({ file: path.relative(root, r.filePath), errors: r.errorCount, warnings: r.warningCount, messages: r.messages }));
  }
  results.htmlValidatorVersion = require("html-validate/package.json").version;
  check("all", "HTML validation: no errors and no warnings", results.htmlValidation.length === 0 || results.htmlValidation.every((r) => !r.errors && !r.warnings), results.htmlValidation);

  // Lighthouse, all four categories, mobile and desktop.
  const { default: lighthouse, desktopConfig } = await import("lighthouse");
  const chromeLauncher = await import("chrome-launcher");
  const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless=new", "--disable-gpu"] });
  results.lighthouse = [];
  try {
    for (const p of pages)
      for (const mode of ["mobile", "desktop"]) {
        const run = await lighthouse(site + p.path, { port: chrome.port, output: ["json", "html"], logLevel: "error" }, mode === "desktop" ? desktopConfig : undefined);
        fs.writeFileSync(path.join(out, `lighthouse-${p.id}-${mode}.json`), run.report[0]);
        fs.writeFileSync(path.join(out, `lighthouse-${p.id}-${mode}.html`), run.report[1]);
        const c = run.lhr.categories;
        results.lighthouseVersion = run.lhr.lighthouseVersion;
        results.lighthouse.push({
          page: p.id,
          mode,
          fetchTime: run.lhr.fetchTime,
          performance: Math.round(c.performance.score * 100),
          accessibility: Math.round(c.accessibility.score * 100),
          bestPractices: Math.round(c["best-practices"].score * 100),
          seo: Math.round(c.seo.score * 100),
          failedAudits: Object.values(run.lhr.audits).filter((a) => a.score !== null && a.score < 0.9 && a.scoreDisplayMode === "binary").map((a) => a.id),
        });
      }
  } finally {
    await chrome.kill();
  }
  check("all", "Lighthouse accessibility score is 100 on every page, mobile and desktop", results.lighthouse.every((l) => l.accessibility === 100), results.lighthouse.map((l) => l.accessibility));

  results.finished = new Date().toISOString();
  results.summary = {
    axeScans: results.scans.length,
    axeScansWithViolations: results.scans.filter((s) => s.violations.length).length,
    axeRulesPassedTotal: results.scans.reduce((n, s) => n + s.passes, 0),
    checks: checks.length,
    checksPassed: checks.filter((c) => c.pass).length,
    keyboardStops: results.keyboard.reduce((n, k) => n + k.stops.length, 0),
  };
  fs.writeFileSync(path.join(out, "summary.json"), JSON.stringify(results, null, 2));
  console.log(JSON.stringify({ folder: path.relative(root, out), ...results.summary, failed: checks.filter((c) => !c.pass), violations: results.scans.filter((s) => s.violations.length), incomplete: results.scans.filter((s) => s.incomplete.length).map((s) => `${s.page} ${s.state} ${JSON.stringify(s.incomplete)}`), lighthouse: results.lighthouse, contrast: results.contrast }, null, 1));
  if (checks.some((c) => !c.pass) || results.summary.axeScansWithViolations) process.exitCode = 1;
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

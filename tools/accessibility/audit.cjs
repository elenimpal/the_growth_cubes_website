const { chromium } = require("playwright");
const axe = require("axe-core");
const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "../..");
const out = path.join(root, "docs/accessibility/reports");
fs.mkdirSync(out, { recursive: true });
const types = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".png": "image/png",
  ".jpg": "image/jpeg",
};
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(
    new URL(req.url, "http://localhost").pathname
  );
  const file = path.resolve(
    root,
    "." + (pathname.endsWith("/") ? pathname + "index.html" : pathname)
  );
  if (!file.startsWith(root + path.sep)) {
    res.writeHead(403).end();
    return;
  }
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404).end();
      return;
    }
    res.setHeader(
      "Content-Type",
      types[path.extname(file)] || "application/octet-stream"
    );
    res.end(data);
  });
});
const checks = [];
function check(name, pass, detail) {
  checks.push({ name, pass, detail });
}
(async () => {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const results = {
    timestamp: new Date().toISOString(),
    timezone: "Europe/Athens",
    environment: process.platform,
    browser: browser.version(),
    axeVersion: axe.version,
    playwrightVersion: require("playwright/package.json").version,
    sourceHashes: {},
    scans: [],
    checks,
  };
  for (const name of [
    "index.html",
    "el/index.html",
    "accessibility.html",
    "styles.css",
    "accessibility.css",
    "forms.js",
  ])
    results.sourceHashes[name] = crypto
      .createHash("sha256")
      .update(fs.readFileSync(path.join(root, name)))
      .digest("hex");
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  async function scan(name, url, viewport, setup) {
    await page.setViewportSize(viewport);
    await page.goto(url, { waitUntil: "networkidle" });
    if (setup) await setup();
    await page.addScriptTag({ content: axe.source });
    const report = await page.evaluate(async () =>
      axe.run(document, {
        runOnly: {
          type: "tag",
          values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
        },
      })
    );
    fs.writeFileSync(
      path.join(out, `${name}.axe.json`),
      JSON.stringify(report, null, 2)
    );
    const overflow = await page.evaluate(() => ({
      width: innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    results.scans.push({
      name,
      url,
      viewport,
      violations: report.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        count: v.nodes.length,
        tags: v.tags,
      })),
      incomplete: report.incomplete.map((v) => ({
        id: v.id,
        count: v.nodes.length,
      })),
      overflow,
    });
    if (!name.startsWith("production"))
      check(
        `${name}: no document horizontal overflow`,
        overflow.scrollWidth <= overflow.width + 1,
        overflow
      );
    if (!name.startsWith("production") && viewport.width <= 900) {
      const clipped = await page.evaluate(() =>
        [...document.querySelectorAll("h1,h2,h3,p,li,label")]
          .filter((e) => {
            if (e.closest("[inert]")) return false;
            const r = e.getBoundingClientRect();
            return r.width > 0 && (r.left < -1 || r.right > innerWidth + 1);
          })
          .map((e) => ({
            text: e.textContent.slice(0, 80),
            left: e.getBoundingClientRect().left,
            right: e.getBoundingClientRect().right,
          }))
      );
      check(
        `${name}: text blocks stay within viewport width`,
        clipped.length === 0,
        clipped
      );
    }
    if (
      [
        "en-desktop",
        "en-mobile-320",
        "en-contact-valid",
        "el-desktop",
        "el-mobile-320",
        "el-contact-valid",
        "statement",
        "production-desktop",
      ].includes(name)
    )
      await page.screenshot({
        path: path.join(out, `${name}.png`),
        fullPage: true,
      });
  }
  try {
    await scan("production-desktop", "https://www.thegrowthcubes.com/", {
      width: 1440,
      height: 900,
    });
    await scan("production-mobile", "https://www.thegrowthcubes.com/", {
      width: 390,
      height: 844,
    });
  } catch (error) {
    results.productionBlocker = error.message;
  }
  // The same scans and checks run against both language versions.
  for (const [lang, url] of [
    ["en", `${base}/`],
    ["el", `${base}/el/`],
  ]) {
    const id = (name) => `${lang}-${name}`;
    await scan(id("desktop"), url, { width: 1440, height: 900 });
    check(
      `${lang}: page declares its language`,
      (await page.locator("html").getAttribute("lang")) === lang,
      null
    );
    check(
      `${lang}: no video, canvas or running animation`,
      await page.evaluate(
        () =>
          !document.querySelector("video, canvas") &&
          document.getAnimations().length === 0
      ),
      null
    );
    await page.keyboard.press("Tab");
    check(
      `${lang}: first Tab reaches skip link`,
      await page
        .locator(".skip-link")
        .evaluate((e) => e === document.activeElement),
      null
    );
    await page.keyboard.press("Enter");
    check(
      `${lang}: skip link focuses main content`,
      await page.locator("main").evaluate((e) => e === document.activeElement),
      null
    );
    const other = lang === "en" ? "el" : "en";
    await page.locator(".lang-link").click();
    check(
      `${lang}: language link opens the ${other} version`,
      (await page.locator("html").getAttribute("lang")) === other,
      page.url()
    );
    for (const [name, width, height] of [
      ["mobile-320", 320, 800],
      ["mobile", 390, 844],
      ["tablet", 768, 1024],
      ["landscape", 844, 390],
      ["reflow-1280-at-400-percent-equivalent", 320, 256],
    ])
      await scan(id(name), url, { width, height });
    await scan(id("text-spacing"), url, { width: 390, height: 844 }, async () =>
      page.addStyleTag({
        content:
          "* {line-height:1.5 !important;letter-spacing:.12em !important;word-spacing:.16em !important;} p {margin-bottom:2em !important;}",
      })
    );
    await scan(
      id("text-resize-200-percent"),
      url,
      { width: 1440, height: 900 },
      async () =>
        page.evaluate(() => {
          const elements = [...document.querySelectorAll("body *")];
          const sizes = elements.map((e) =>
            parseFloat(getComputedStyle(e).fontSize)
          );
          elements.forEach((e, i) => (e.style.fontSize = `${sizes[i] * 2}px`));
        })
    );
    await scan(
      id("contact-invalid"),
      url,
      { width: 390, height: 844 },
      async () => page.locator("#contact-form button").click()
    );
    check(
      `${lang}: contact validation focuses first invalid field`,
      await page
        .locator("#contact-name")
        .evaluate(
          (e) =>
            e === document.activeElement &&
            e.getAttribute("aria-invalid") === "true"
        ),
      await page.locator("#contact-status").innerText()
    );
    await scan(id("contact-valid"), url, { width: 390, height: 844 }, async () => {
      await page.locator("#contact-name").fill("Accessibility test");
      await page.locator("#contact-email").fill("test@example.com");
      await page.locator("#contact-message").fill("Test draft — not sent.");
      await page.locator("#contact-form button").click();
    });
    check(
      `${lang}: contact prepares an email draft without claiming delivery`,
      await page
        .locator("#contact-email-draft")
        .evaluate(
          (e) =>
            !e.hidden && e.href.startsWith("mailto:info@thegrowthcubes.com")
        ),
      await page.locator("#contact-status").innerText()
    );
    await scan(
      id("newsletter-invalid"),
      url,
      { width: 390, height: 844 },
      async () => page.locator("#newsletter-form button").click()
    );
    await scan(
      id("newsletter-valid"),
      url,
      { width: 390, height: 844 },
      async () => {
        await page.locator("#newsletter-email").fill("test@example.com");
        await page.locator("#newsletter-form button").click();
      }
    );
    check(
      `${lang}: newsletter prepares draft without claiming subscription`,
      await page
        .locator("#newsletter-email-draft")
        .evaluate((e) => !e.hidden && e.href.startsWith("mailto:")),
      null
    );
    const nojs = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 },
    });
    const fallback = await nojs.newPage();
    await fallback.goto(url);
    check(
      `${lang}: without JavaScript navigation and content stay visible`,
      (await fallback.locator(".nav a").first().isVisible()) &&
        (await fallback.locator(".card").last().isVisible()),
      null
    );
    await nojs.close();
  }
  await scan("statement", `${base}/accessibility.html`, {
    width: 390,
    height: 844,
  });
  await scan("statement-desktop", `${base}/accessibility.html`, {
    width: 1440,
    height: 900,
  });
  check("No local JavaScript runtime errors", errors.length === 0, errors);
  fs.writeFileSync(
    path.join(out, "summary.json"),
    JSON.stringify(results, null, 2)
  );
  console.log(
    JSON.stringify(
      {
        scans: results.scans.length,
        localViolations: results.scans
          .filter((s) => !s.name.startsWith("production"))
          .flatMap((s) => s.violations),
        checks: checks.length,
        failedChecks: checks.filter((c) => !c.pass),
        productionBlocker: results.productionBlocker,
      },
      null,
      2
    )
  );
  await browser.close();
  server.closeAllConnections();
  server.close();
  if (
    results.scans.some(
      (s) => !s.name.startsWith("production") && s.violations.length
    ) ||
    checks.some((c) => !c.pass)
  )
    process.exitCode = 1;
})().catch((error) => {
  console.error(error);
  server.close();
  process.exitCode = 1;
});

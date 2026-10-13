const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
(async () => {
  const { default: lighthouse } = await import("lighthouse");
  const chromeLauncher = await import("chrome-launcher");
  const root = path.resolve(__dirname, "../..");
  const server = http.createServer((req, res) => {
    const pathname = new URL(req.url, "http://localhost").pathname;
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
        {
          ".html": "text/html",
          ".css": "text/css",
          ".js": "text/javascript",
          ".jpg": "image/jpeg",
          ".png": "image/png",
        }[path.extname(file)] || "application/octet-stream"
      );
      res.end(data);
    });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const chrome = await chromeLauncher.launch({
    chromePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    chromeFlags: ["--headless", "--disable-gpu"],
  });
  try {
    for (const [name, url] of [
      ["home", `http://127.0.0.1:${server.address().port}/`],
      ["home-el", `http://127.0.0.1:${server.address().port}/el/`],
      [
        "statement",
        `http://127.0.0.1:${server.address().port}/accessibility.html`,
      ],
    ]) {
      const result = await lighthouse(url, {
        port: chrome.port,
        onlyCategories: ["accessibility"],
        output: ["json", "html"],
        logLevel: "error",
      });
      for (const [i, ext] of ["json", "html"].entries())
        fs.writeFileSync(
          path.join(
            root,
            "docs/accessibility/reports",
            `lighthouse-${name}.${ext}`
          ),
          result.report[i]
        );
      console.log(name, result.lhr.categories.accessibility.score);
    }
  } finally {
    await chrome.kill();
    server.closeAllConnections();
    server.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

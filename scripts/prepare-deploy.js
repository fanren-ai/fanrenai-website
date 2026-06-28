const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const outputDir = path.join(root, "dist");
const entries = [
  "index.html",
  "404.html",
  "styles.css",
  "script.js",
  "robots.txt",
  "sitemap.xml",
  "assets",
  "about",
  "community",
  "execute",
  "tools",
  "tutorials"
];

function copyRecursive(source, target) {
  const stats = fs.statSync(source);
  if (stats.isDirectory()) {
    fs.mkdirSync(target, { recursive: true });
    fs.readdirSync(source).forEach((name) => {
      copyRecursive(path.join(source, name), path.join(target, name));
    });
    return;
  }

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

entries.forEach((entry) => {
  const source = path.join(root, entry);
  if (!fs.existsSync(source)) {
    throw new Error(`Missing deploy entry: ${entry}`);
  }
  copyRecursive(source, path.join(outputDir, entry));
});

console.log(`Prepared deploy output in ${path.relative(root, outputDir)}`);

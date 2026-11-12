import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (path) => readFileSync(join(root, path), "utf8");
function pages(dir = "") {
  return readdirSync(join(root, dir), { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith(".") || entry.name === "node_modules") return [];
    const path = join(dir, entry.name);
    return entry.isDirectory() ? pages(path) : path.endsWith(".html") ? [path] : [];
  });
}
const files = pages();
const canonical = (html) => html.match(/<link rel="canonical" href="([^"]+)"/)[1];

test("every published page has one unique canonical URL included in the sitemap", () => {
  const urls = files.map((file) => {
    const html = read(file);
    assert.equal((html.match(/rel="canonical"/g) || []).length, 1, file);
    assert.match(html, /<title>[^<]+<\/title>/, file);
    assert.match(html, /name="description"\s+content="[^"]+"/, file);
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1, file);
    const url = canonical(html);
    assert.equal(new URL(url).origin, "https://typez.app", file);
    return url;
  });
  assert.equal(new Set(urls).size, urls.length);
  const sitemap = [...read("sitemap.xml").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.deepEqual(sitemap.sort(), urls.sort());
  assert.match(read("robots.txt"), /Sitemap: https:\/\/typez\.app\/sitemap\.xml/);
  assert.doesNotMatch(read("robots.txt"), /Disallow: \/\s/);
});

test("internal page links, images, scripts, styles and fragment targets resolve", () => {
  for (const file of files) {
    const html = read(file);
    for (const [, attribute, value] of html.matchAll(/\b(href|src)="([^"]+)"/g)) {
      const basePath = file.endsWith("index.html") ? dirname(file) + "/" : file;
      const url = new URL(value.replaceAll("&amp;", "&"), "https://typez.app/" + basePath);
      if (url.origin !== "https://typez.app") continue;
      let target = decodeURIComponent(url.pathname).slice(1);
      if (target === "support") target = "support.html";
      if (!target || target.endsWith("/")) target += "index.html";
      assert.ok(existsSync(join(root, target)), `${file}: ${attribute}=${value}`);
      assert.ok(statSync(join(root, target)).isFile(), `${file}: ${value} is a directory`);
      if (url.hash && target.endsWith(".html")) {
        const id = decodeURIComponent(url.hash.slice(1));
        assert.ok(read(target).includes(`id="${id}"`), `${file}: missing ${value}`);
      }
    }
  }
});

test("article structured data points to its canonical URL and actual image", () => {
  const html = read("guides/iphone-clipboard-history/index.html");
  const data = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]+?)<\/script>/)[1]);
  const article = data["@graph"].find((item) => item["@type"] === "Article");
  assert.equal(article.mainEntityOfPage, canonical(html));
  assert.ok(existsSync(join(root, new URL(article.image).pathname)));
  assert.equal(article.author.name, "Javokhir");
  const crumbs = data["@graph"].find((item) => item["@type"] === "BreadcrumbList");
  assert.equal(crumbs.itemListElement.at(-1).item, canonical(html));
});

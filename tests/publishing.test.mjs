import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { publishNext, seoulDate } from "../scripts/publish-guide.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
function fixture(t) {
  const dir = mkdtempSync(join(tmpdir(), "typez-publishing-"));
  for (const name of ["guides", "sitemap.xml", ".publishing"]) cpSync(join(root, name), join(dir, name), { recursive: true });
  const queuePath = join(dir, ".publishing/queue.json");
  const queue = JSON.parse(readFileSync(queuePath));
  // Exercise scheduler behavior independently of the live queue's publication state.
  queue.articles.forEach((a, i) => { delete a.publishedOn; a.scheduledFor = ["2026-11-13", "2026-11-16", "2026-11-18"][i]; });
  for (const article of queue.articles) rmSync(join(dir, "guides", article.slug), { recursive: true, force: true });
  writeFileSync(queuePath, JSON.stringify(queue));
  writeFileSync(join(dir, "guides/index.html"), '<script type="application/ld+json">{"@type":"CollectionPage","hasPart":[]}</script><!-- GUIDE CARDS --><!-- /GUIDE CARDS -->');
  writeFileSync(join(dir, "sitemap.xml"), '<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}

test("publication date follows Seoul time at the UTC date boundary", () => {
  assert.equal(seoulDate(new Date("2026-11-12T16:00:00Z")), "2026-11-13");
});

test("no publication before due date, on off-days, or after queue is exhausted", (t) => {
  const dir = fixture(t);
  assert.equal(publishNext(dir, "2026-11-11").published, false);
  assert.equal(publishNext(dir, "2026-11-12").published, false);
  assert.equal(publishNext(dir, "2026-11-14").published, false);
  for (const date of ["2026-11-13", "2026-11-16", "2026-11-18"]) assert.equal(publishNext(dir, date).published, true);
  assert.equal(publishNext(dir, "2026-11-20").published, false);
});

test("publishes one due article with actual dates and updates discovery atomically before commit", (t) => {
  const dir = fixture(t);
  const result = publishNext(dir, "2026-11-13");
  assert.equal(result.slug, "iphone-keyboard-number-row");
  const html = readFileSync(join(dir, "guides", result.slug, "index.html"), "utf8");
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]+?)<\/script>/)[1]);
  assert.equal(schema["@graph"][0].datePublished, "2026-11-13");
  assert.equal(schema["@graph"][0].mainEntityOfPage, result.url);
  assert.ok(readFileSync(join(dir, "guides/index.html"), "utf8").includes(result.url));
  assert.ok(readFileSync(join(dir, "sitemap.xml"), "utf8").includes(`<loc>${result.url}</loc>`));
  assert.equal(publishNext(dir, "2026-11-13").published, false);
  assert.equal(existsSync(join(dir, "guides/iphone-keyboard-full-access/index.html")), false);
});

test("a delayed run publishes one overdue draft rather than dumping the backlog", (t) => {
  const dir = fixture(t);
  const result = publishNext(dir, "2026-11-20");
  assert.equal(result.slug, "iphone-keyboard-number-row");
  assert.equal(result.date, "2026-11-20");
  assert.equal(publishNext(dir, "2026-11-20").published, false);
  assert.equal(existsSync(join(dir, "guides/iphone-keyboard-full-access/index.html")), false);
});

test("refuses to overwrite an existing article and leaves discovery files unchanged", (t) => {
  const dir = fixture(t);
  const original = readFileSync(join(dir, "sitemap.xml"), "utf8");
  cpSync(join(dir, "guides/iphone-clipboard-history"), join(dir, "guides/iphone-keyboard-number-row"), { recursive: true });
  assert.throws(() => publishNext(dir, "2026-11-13"), /Refusing to replace/);
  assert.equal(readFileSync(join(dir, "sitemap.xml"), "utf8"), original);
});

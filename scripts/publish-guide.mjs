import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const origin = "https://typez.app";
const escape = (s) => s.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const jsonScript = (value) => JSON.stringify(value, null, 2).replaceAll("<", "\\u003c");
export const seoulDate = (instant = new Date()) => new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit",
}).format(instant);

export function renderArticle(article, date, original) {
  const path = `/guides/${article.slug}/`;
  const pretty = new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC", year: "numeric", month: "long", day: "numeric",
  });
  // Share the existing site's navigation and footer without introducing a build step.
  const nav = original.match(/<a class="skip-link"[\s\S]+?<\/header>/)[0];
  const footer = original.slice(original.lastIndexOf("<footer"), original.lastIndexOf("</body>"));
  const schema = { "@context": "https://schema.org", "@graph": [
    { "@type": "Article", headline: article.title, description: article.description,
      mainEntityOfPage: origin + path, datePublished: date, dateModified: date,
      author: { "@type": "Person", name: "Javokhir", url: origin + "/" },
      publisher: { "@type": "Organization", name: "Typez", url: origin + "/" } },
    { "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: origin + "/" },
      { "@type": "ListItem", position: 2, name: "Guides", item: origin + "/guides/" },
      { "@type": "ListItem", position: 3, name: article.title, item: origin + path },
    ] },
  ] };
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escape(article.title)} — Typez</title>
    <meta name="description" content="${escape(article.description)}" />
    <link rel="canonical" href="${origin}${path}" />
    <meta property="og:title" content="${escape(article.title)}" />
    <meta property="og:description" content="${escape(article.description)}" />
    <meta property="og:url" content="${origin}${path}" />
    <meta property="og:type" content="article" />
    <meta name="theme-color" content="#f2f2f7" />
    <link rel="icon" type="image/png" href="/assets/typez-icon.png" />
    <link rel="apple-touch-icon" href="/assets/typez-icon.png" />
    <link rel="stylesheet" href="/styles.css?v=7" />
    <link rel="stylesheet" href="/guides.css?v=1" />
    <script type="application/ld+json">${jsonScript(schema)}</script>
  </head>
  <body>
    ${nav}
    <main id="main-content" class="guide-shell shell">
      <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/guides/">Guides</a><span aria-hidden="true">/</span><span aria-current="page">${escape(article.category)}</span></nav>
      <article>
        <header class="guide-header">
          <p class="eyebrow">iPhone keyboard guides</p>
          <h1>${escape(article.title)}</h1>
          <p class="guide-deck">${escape(article.deck)}</p>
          <p class="guide-byline">By Javokhir, creator of Typez · Published <time datetime="${date}">${pretty}</time><br />Published by Typez, an iPhone keyboard app currently in App Store review.</p>
        </header>
        <div class="guide-body">
          <div class="guide-answer"><p>${escape(article.answer)}</p></div>
          <nav class="guide-toc" aria-label="In this guide"><h2>In this guide</h2><ol>
            ${article.sections.map(([id, title]) => `<li><a href="#${id}">${escape(title)}</a></li>`).join("\n            ")}
          </ol></nav>
          ${article.sections.map(([id, title, content]) => `<h2 id="${id}">${escape(title)}</h2>\n          ${content}`).join("\n          ")}
          <aside class="guide-cta" aria-labelledby="guide-cta-title">
            <p class="eyebrow">Try Typez on TestFlight</p>
            <h2 id="guide-cta-title">Make everyday typing easier.</h2>
            <p>Join the waitlist and we'll send you a TestFlight invitation, plus an update when Typez launches on the App Store.</p>
            <a class="primary-button" href="/#waitlist">Join the waitlist</a>
          </aside>
          <section class="guide-sources" aria-labelledby="sources-title">
            <h2 id="sources-title">Sources and further reading</h2><ul>
              ${article.sources.map(([label, href]) => `<li><a href="${escape(href)}">${escape(label)}</a></li>`).join("\n              ")}
            </ul><p>Menu wording and behavior can vary by iOS version, language, and app. Typez details describe the current pre-release app. This guide does not claim independent device testing.</p>
          </section>
        </div>
      </article>
    </main>
    ${footer}
  </body>
</html>
`;
}

export function publishNext(root, today = seoulDate()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(today) || Number.isNaN(Date.parse(today))) throw new Error("Invalid publication date");
  if (![1, 3, 5].includes(new Date(`${today}T12:00:00Z`).getUTCDay())) return { published: false, reason: "Not a Monday, Wednesday, or Friday in Seoul" };
  const queuePath = join(root, ".publishing/queue.json");
  const queue = JSON.parse(readFileSync(queuePath, "utf8"));
  if (queue.articles.some((a) => a.publishedOn === today)) return { published: false, reason: "Already published a queued guide today" };
  const article = queue.articles.filter((a) => !a.publishedOn && a.scheduledFor <= today)
    .sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor))[0];
  if (!article) return { published: false, reason: "No prepared guide is due; add reviewed drafts to the queue" };
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug)) throw new Error("Invalid slug");
  if (!article.title || !article.description || !article.sections?.length || !article.sources?.length) throw new Error("Incomplete draft");
  if (new Set(article.sections.map(([id]) => id)).size !== article.sections.length) throw new Error("Duplicate section IDs");
  const destination = join(root, "guides", article.slug);
  if (existsSync(destination)) throw new Error(`Refusing to replace existing guide: ${article.slug}`);
  const path = `/guides/${article.slug}/`;
  const url = origin + path;
  const original = readFileSync(join(root, "guides/iphone-clipboard-history/index.html"), "utf8");
  const rendered = renderArticle(article, today, original);
  let index = readFileSync(join(root, "guides/index.html"), "utf8");
  if (!index.includes("<!-- GUIDE CARDS -->")) throw new Error("Guide index insertion marker missing");
  const pretty = new Date(`${today}T12:00:00Z`).toLocaleDateString("en-US", { timeZone: "UTC", year: "numeric", month: "long", day: "numeric" });
  const card = `<article class="guide-card">
        <p class="guide-card-date"><time datetime="${today}">${pretty}</time> · ${escape(article.category)}</p>
        <h2><a href="${path}">${escape(article.title)}</a></h2>
        <p>${escape(article.description)}</p>
        <a class="guide-card-link" href="${path}">Read the guide →</a>
      </article>`;
  index = index.replace("<!-- GUIDE CARDS -->", `<!-- GUIDE CARDS -->\n      ${card}`);
  index = index.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/, (_, open, json, close) => {
    const data = JSON.parse(json);
    data.hasPart = [...(Array.isArray(data.hasPart) ? data.hasPart : [data.hasPart]), { "@type": "Article", headline: article.title, url }];
    return open + jsonScript(data) + close;
  });
  const sitemap = readFileSync(join(root, "sitemap.xml"), "utf8");
  if (!sitemap.includes("</urlset>") || sitemap.includes(`<loc>${url}</loc>`)) throw new Error("Unexpected sitemap state");
  article.publishedOn = today;
  // Finish validation/rendering before changing any file. CI commits only after tests pass.
  mkdirSync(destination, { recursive: true });
  writeFileSync(join(destination, "index.html"), rendered);
  writeFileSync(join(root, "guides/index.html"), index);
  writeFileSync(join(root, "sitemap.xml"), sitemap.replace("</urlset>", `  <url><loc>${url}</loc></url>\n</urlset>`));
  writeFileSync(queuePath, JSON.stringify(queue, null, 2) + "\n");
  return { published: true, slug: article.slug, date: today, url };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(publishNext(fileURLToPath(new URL("../", import.meta.url)))));
}

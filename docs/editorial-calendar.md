# Typez guide calendar

Cadence: Monday, Wednesday, Friday at **10:00 Asia/Seoul** (01:00 UTC).
GitHub's scheduled runner may start late; this is a target time, not a delivery SLA.
The first clipboard guide went live November 12, 2026. Do not publish it again.

## Prepared queue

These three complete articles are in `.publishing/queue.json`, not in the public
guides directory. The publication script generates the page, index card,
structured data, and sitemap entry on its actual publication date.

| Planned Seoul date | Guide | Reader's need |
| --- | --- | --- |
| Fri, Nov 13, 2026 | How to Get a Number Row on Your iPhone Keyboard | Type mixed letters and digits with less layout switching |
| Mon, Nov 16, 2026 | What Does Allow Full Access Mean for iPhone Keyboards? | Understand permissions before enabling a keyboard |
| Wed, Nov 18, 2026 | Why Does iPhone Keep Switching Back to Apple's Keyboard? | Distinguish system restrictions from a setup problem |

Apple's live keyboard user-guide pages and archived custom-keyboard developer
documentation were read while preparing these drafts. The developer source is
identified as archived in the articles. Do not claim device testing that was not
performed. App Store review status and TestFlight copy must be revisited if the
app launches before these articles publish.

## Topics to research next

These are hypotheses based on reader problems and Typez's actual features, not
verified keyword-volume or keyword-difficulty data. Research the current search
results and Apple documentation before turning each into a draft.

| Priority | Working title | Distinct angle / evidence needed |
| --- | --- | --- |
| 1 | How to Move the Cursor Precisely on iPhone | Spacebar method, character/word controls; record an original demo |
| 2 | iPhone Text Replacement Not Working? What to Check | Language, shortcut entry, keyboard compatibility; verify current iOS |
| 3 | How to Save Replies You Send Often on iPhone | Real message templates, shortcuts vs choosing a saved item; link to clipboard overview |
| 4 | How to Select and Edit Text on iPhone Without Retyping | Selection handles, cursor placement, correction examples |
| 5 | How to Undo Accidental Typing or Deletion on iPhone | Undo gestures and limits; distinguish editing history from clipboard history |
| 6 | How to Switch Between iPhone Keyboards and Change Their Order | Setup guide; keep separate from the published troubleshooting guide |
| 7 | How to Type Numbers and Symbols Faster on iPhone | Built-in gestures and symbol shortcuts; avoid duplicating the number-row article |
| 8 | iPhone Keyboard Feedback: Sound, Haptics, and Settings | Explain actual controls without implying Typez implements unverified options |
| 9 | Apple Keyboard vs Typez: Which Fits Your Typing? | Firsthand comparison, screenshots, limitations, clear ownership disclosure |
| 10 | Best iPhone Keyboard Apps for Different Needs | Test actual competing apps, current pricing and languages before recommending |

Fold overlapping questions into an existing article instead of creating a new
page for every keyword variation. Prefer English guides first; do not generate
translations without a way to check their accuracy.

## How scheduled publication works

`.github/workflows/publish-guides.yml` runs the dependency-free Node publisher.
It uses GitHub's repository-scoped token; no AI API key or additional package is
required. It **publishes prepared text**; it does not research or write future
articles. There are exactly three prepared posts; after those, the job reports
an empty queue and makes no changes until more reviewed drafts are added.

The script only publishes on a Monday, Wednesday, or Friday in Seoul, chooses at
most one due draft, and refuses to publish another queued article on the same
date. A missed slot is handled by publishing one overdue draft at the next slot;
it does not release all missed articles together. Actual publication dates go
into the page and structured data. Existing pages are never overwritten.

Automated commits identify GitHub Actions as committer and preserve the original
guide author's identity for the authored content. The existing Vercel Git
integration handles deployment. Repository policies, branch protection, or a
disabled Actions schedule can prevent publication; a job definition alone is
not proof that a scheduled run and Vercel deployment succeeded.

To pause, disable the workflow in GitHub Actions. To defer one post, move its
`scheduledFor` date forward in the queue. To stop future releases, remove the
unpublished drafts from the queue. Do not delete `publishedOn` from a released
item: that field prevents accidental duplicate publication.

To preview or test a future date, copy the checkout to a temporary directory
outside `/workspace/typez-web` and call `publishNext(tempRoot, 'YYYY-MM-DD')`.
Run the site checks there and inspect the generated pages. Do not use a future
date against the live checkout. The normal command always uses today's date
in Seoul and never receives a date from an untrusted workflow input.

Run `node --test tests/*.test.mjs` before pushing new drafts or publisher changes.
Use the [search pilot](search-pilot.md) to evaluate non-brand impressions,
relevant clicks, and tester interest after 8–12 weeks. Keep the scheduling and
content quality decisions separate from evidence of SEO success.

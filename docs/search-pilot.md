# Typez search pilot

Start with one useful guide and measure it before committing to a publishing rate.
First page: `/guides/iphone-clipboard-history/`.
Primary question: “Does iPhone have clipboard history?” Related intent: finding
copied text and saving text for reuse. These are topic choices, not verified
search-volume estimates. Keep the page helpful even if the reader never tries Typez.

## Baseline

Source: the owner's Search Console export dated November 12, 2026. Although the
filter says “Last 3 months,” the daily rows provided cover October 21–November 9:

- 192 impressions, 9 clicks (4.69% CTR).
- The exact query `typez` accounts for 150 impressions and 8 clicks.
- 8 of 9 clicks came from desktop; 1 came from mobile.
- None of the listed queries clearly target a keyboard feature or problem.

Search Console can omit low-volume queries; listed query totals do not account
for all site traffic. This short baseline is not a traffic forecast.

## After the site deployment

1. Confirm `/guides/` and `/guides/iphone-clipboard-history/` return 200 on production.
2. Confirm `/robots.txt` and `/sitemap.xml` are accessible without authentication.
3. Confirm `https://www.typez.app/guides/iphone-clipboard-history/` redirects to the
   same path on `https://typez.app`. Check `/index.html` redirects to `/` and
   `/support.html` redirects to `/support`, without redirect loops.
4. Inspect the article's canonical URL with Search Console URL Inspection, run
   the live test, and request indexing once. Submit `https://typez.app/sitemap.xml`
   in the Sitemaps section of the verified domain property. These are owner actions;
   generating a sitemap does not submit it or establish that Google indexed it.
5. Validate Article and BreadcrumbList data with Google's Rich Results Test.
   Valid markup makes the page understandable; it does not guarantee rich results.
6. Record the actual deployment date. Compare complete periods after that date,
   allowing for Search Console's reporting lag.

## Measure the pilot

Check indexing after about a week. Review search performance weekly, then make
an initial content decision after 8–12 weeks. This is a review window, not a
promise that a new site will rank within it.

For the article URL, record weekly impressions, clicks, CTR, average position,
and the queries that generate impressions. Separate branded searches from
non-brand questions. Also review mobile traffic: impressions on unrelated
queries or desktop-only visits may not translate into iPhone testers.

Use existing Vercel Web Analytics for article page views and Brevo for new
waitlist contacts. Record TestFlight invitations sent and accepted separately
in App Store Connect. The current site does not attribute a Brevo signup to an
individual article, and aggregate signup changes do not prove SEO caused them.
Once the app launches, replace waitlist CTAs with the real App Store listing and
use App Store Connect campaign links to measure acquisition where supported.

If the page is not indexed, diagnose crawl access, canonical selection, and
content usefulness first. If it earns relevant impressions but few clicks,
review the title and search intent. If it earns visits but few signups, improve
the connection between the guide and the product. Expand into related topics
when relevant non-brand discovery is growing; avoid creating near-duplicate
articles just to meet a daily quota.

## Publish the next guide

- Choose one distinct reader question related to a real Typez capability.
- Verify iOS instructions against current Apple documentation and a device;
  identify version-dependent behavior rather than inventing steps or test results.
- Write a direct answer, useful steps, limitations, and a relevant optional CTA.
- Use original product images where they help. Disclose that Typez publishes it.
- Add `guides/<descriptive-slug>/index.html`, link it from `/guides/`, and add its
  canonical URL to `sitemap.xml`. Link to it from related existing content.
- Include a unique title, description, self-canonical, share metadata, visible
  author and real dates, plus matching Article and BreadcrumbList data. Keep the
  URL evergreen. Change modification dates only for substantive updates.
- Run `node --test tests/*.test.mjs`, then inspect mobile and desktop rendering,
  image loading, keyboard navigation, and the waitlist flow with a mocked request.
- Deploy through the repository's Vercel workflow. Repeat production URL checks.

## TestFlight operations

The waitlist form stores email addresses in Brevo; it does not call App Store
Connect. The owner must invite consenting subscribers through TestFlight.
External testing may require Apple's beta review before invitations can be used.
Do not submit real contacts as part of automated tests. Keep invitation and
launch messages consistent with the consent text and honor unsubscribes.

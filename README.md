# Typez website

Minimal static website for the Typez iPhone keyboard.

## Files

- `index.html` — landing page
- `privacy.html` — privacy policy
- `terms.html` — terms of use
- `support.html` — support contact and keyboard/purchase help
- `styles.css` — shared styling for all pages
- `waitlist.js` — email-only Brevo waitlist submission and feedback
- `guides/` — static guide index and articles
- `guides.css` — guide layouts, loaded only on guide pages
- `robots.txt` and `sitemap.xml` — crawl guidance and canonical page list
- `vercel.json` — serves `/support` and redirects duplicate domain/page URLs

There is no framework, package manager, JavaScript bundle, or build step.

## Launch waitlist

The landing page submits to the public endpoint for Brevo's **TypeZ launch
waitlist** form, which adds contacts to **Typez Launch List**. No API key belongs
in this repository. The form keeps Brevo's `EMAIL`, `email_address_check`
(honeypot), and `locale` fields; the browser validates email format before sending.
Success appears only after Brevo confirms the signup. A failed request keeps the
email available for retry. Without JavaScript, the form posts to Brevo directly.

Manage the form's list and confirmation settings in Brevo. Currently it uses
**No confirmation email**; Brevo requires account phone verification to enable
single or double confirmation. If you add fields or change the confirmation
flow, regenerate the embed and update this integration to match.

Run the submission checks with `node --test tests/waitlist.test.mjs`. Before
publishing, submit an address you own through the local page, verify the success
message, and find that contact in **Typez Launch List** in Brevo.

While the app is in App Store review, the waitlist offers TestFlight invitations
and launch updates. The form only adds contacts to Brevo: it does **not** enroll
testers or send TestFlight invitations automatically. Invite opted-in contacts
through App Store Connect and manage unsubscribes before sending updates.

## Guides and search

Run all checks with `node --test tests/*.test.mjs`. The search checks validate
canonical/sitemap coverage, local links and assets, fragments, and article data.
There is still no build step. Python serves the `/guides/` directories directly;
Vercel applies the host and legacy-page redirects after deployment.

See [the search pilot](docs/search-pilot.md) for the baseline, publishing checklist,
production checks, and how to evaluate the first post.

## Privacy policy source of truth

`privacy.html` is the canonical Typez privacy policy. The iOS app links to the
deployed page instead of bundling a duplicate policy. Update this page whenever
the Amplitude, RevenueCat, keyboard, purchase, or website data practices change.

## Preview locally

From this directory, run:

```sh
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

The basic Python server does not apply Vercel rewrites. Preview the support
page at `http://localhost:8080/support.html`; Vercel serves the published page
at `https://typez.app/support`. Use that exact HTTPS URL for the App Store
Connect Support URL. Keep `support@typez.app` routing active and monitored.

## Deploy on Vercel

1. Import this GitHub repository into Vercel.
2. Choose **Other** for the Framework Preset.
3. Leave the Build Command empty.
4. Serve the repository root (`.`) as the Output Directory.
5. Deploy. Every push to `main` will update production.

## Connect a Cloudflare-managed domain

1. Add the domain to the Vercel project under **Settings → Domains**.
2. Use the DNS records Vercel provides for that specific domain.
3. Add those records in Cloudflare DNS with **Proxy status: DNS only** (grey cloud).
4. Verify the domain in Vercel and choose the canonical `www` or apex address.

## Before the public launch

- Connect the final Typez domain.
- Replace the waitlist form and waitlist links with the final Typez App Store listing URL once the app is available.
- Keep `https://typez.app` as the canonical domain and update the sitemap when adding pages.
- Review the privacy policy and terms whenever the app's data practices change.
- Configure and document the production Amplitude retention period before release.
- Keep `support@typez.app` routing active and monitored.
- Keep the developer or business identity in the legal pages current.

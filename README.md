# Typez website

Minimal static website for the Typez iPhone keyboard.

## Files

- `index.html` — landing page
- `privacy.html` — privacy policy
- `terms.html` — terms of use
- `support.html` — support contact and keyboard/purchase help
- `styles.css` — shared styling for all pages
- `vercel.json` — serves `/support` from `support.html`

There is no framework, package manager, JavaScript bundle, or build step.

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
- Replace every `https://apps.apple.com/` placeholder with the final Typez App Store listing URL.
- Add the canonical URL and social-sharing image after the final domain is chosen.
- Review the privacy policy and terms whenever the app's data practices change.
- Configure and document the production Amplitude retention period before release.
- Keep `support@typez.app` routing active and monitored.
- Keep the developer or business identity in the legal pages current.

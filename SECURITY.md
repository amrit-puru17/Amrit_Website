# Security — manual steps & deployment notes

Code-side hardening is in `index.html`, `app.js`, and `thanks.js`. Complete these **Web3Forms dashboard** steps to protect the contact form inbox.

## Web3Forms dashboard (required)

1. Sign in at [web3forms.com](https://web3forms.com) with **acharyapurushottam177@gmail.com**.
2. Open your form / access key settings.
3. **Allowed domains** — restrict submissions to:
   - `purushottam-acharya.com.np`
   - `www.purushottam-acharya.com.np`
   - (Optional for local testing: `localhost`)
4. **Captcha** — if your plan includes it, enable **hCaptcha** or **reCAPTCHA** in the dashboard, then add Web3Forms’ captcha snippet to `index.html` inside the contact `<form>` (see [Web3Forms spam protection](https://docs.web3forms.com/getting-started/customizations/spam-protection)). Update the CSP `script-src` and `frame-src` in `index.html` to allow `https://hcaptcha.com` and `https://*.hcaptcha.com` (or Google reCAPTCHA hosts if you use that instead).
5. **Rotate access key** if you see spam:
   - Generate a new access key in the dashboard.
   - Replace the value of `#web3forms-access-key` in `index.html`.
   - Redeploy the site.
   - Revoke or delete the old key.

## GitHub Pages vs HTTP headers

Plain **GitHub Pages** does not read `_headers` from the repo. Security policy for browsers is delivered via `<meta>` tags in `index.html` and `thanks.html`. CSP must allow `https://unpkg.com` in `style-src` and `font-src` so Phosphor Icons can load its stylesheets and icon font.

If you later put **Cloudflare** (or Netlify) in front of the site, you can serve real HTTP headers from `_headers` (see file in repo root) and optionally remove redundant meta CSP after testing.

## Unused files

`charts.js` and `three-bg.js` are not loaded by `index.html` and pose no runtime risk while unused. Do not add them to the page unless needed.

## Manual test checklist

- [ ] Home page loads, theme toggle works
- [ ] Mobile menu works
- [ ] Scroll animations work
- [ ] Phosphor icons render
- [ ] Contact form submits successfully on deployed HTTPS URL
- [ ] Success message appears after `thanks.html` redirect
- [ ] Honeypot/cooldown blocks rapid resubmit
- [ ] No console CSP violations

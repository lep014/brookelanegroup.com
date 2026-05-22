# Brooke Lane Group — Website

A static, self-hosted replacement for the Wix site at brookelanegroup.com.
No build step, no framework, no dependencies — just HTML, CSS, and a small
JavaScript file. It loads fast and works on any host.

## Pages

| File                    | Purpose                                  |
|-------------------------|------------------------------------------|
| `index.html`            | Home (all sections on one scrolling page)|
| `contact.html`          | Contact page + form                      |
| `privacy-policy.html`   | Privacy Policy                           |
| `terms-of-service.html` | Terms of Service (SMS)                   |

Supporting files: `assets/` (css, js, images), `sitemap.xml`, `robots.txt`.

## Preview it locally

Double-click `index.html` to open it in a browser, or run a local server
from this folder:

```
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

## Make the contact form work

The form currently points at a placeholder. To receive submissions by email:

1. Go to <https://formspree.io> and create a free account.
2. Create a new form — it gives you an ID like `xyzabcde`.
3. Open `contact.html` and find this line:
   ```html
   <form class="form-card reveal" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
   ```
4. Replace `YOUR_FORM_ID` with your real ID.

That's it — submissions will be emailed to you. (If you'd rather not use a
third-party service, the page can be switched to a plain "email us" button
instead — just ask.)

## Deploy it (GitHub Pages)

This site is hosted on GitHub Pages from the `main` branch. To publish a
change, commit and push to `main` — GitHub rebuilds the live site within
about a minute.

The custom domain is controlled by the `CNAME` file (`www.brookelanegroup.com`).
For the domain to resolve, these DNS records must exist at the domain
registrar:

| Record | Host | Value |
|--------|------|-------|
| CNAME  | `www` | `luflow4.github.io` |
| A      | `@`   | `185.199.108.153` |
| A      | `@`   | `185.199.109.153` |
| A      | `@`   | `185.199.110.153` |
| A      | `@`   | `185.199.111.153` |

Once the domain resolves and loads over HTTPS, the old Wix site can be
cancelled.

## Editing content

- **Hero rotating phrases** — `assets/js/main.js`, the `phrases` array near
  the top. Each entry follows the static word "We".
- **Text** — edit directly in the `.html` files; the markup is labelled with
  comments for each section.
- **Images** — in `assets/img/`. Replace a file with one of the same name to
  swap it. Images are already compressed for the web.
- **Colors & fonts** — `assets/css/styles.css`, the `:root` block at the top.

## Notes

- Headings use **Libre Caslon Text** (a close, free match for the site's
  Adobe Caslon) and body text uses **Mulish**, both loaded from Google Fonts.
- The footer copyright reads "© 2025"; update it in each `.html` file's
  footer when the year changes.
- The privacy and terms pages are marked `noindex` so they stay out of
  search results, matching how legal pages are normally handled.

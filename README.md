# YeshBo · Yeshiva Bonilla Client Preview

Static demonstration of the Yeshiva Bonilla Torah learning platform for client evaluation.

## Cloudflare Pages from GitHub

1. Connect the `yeshbo` GitHub repository in Cloudflare Dashboard → Workers & Pages → Create application → Pages → Import an existing Git repository.
2. Select branch `main` and framework **None**.
3. Build command: **leave blank**.
4. Build output directory: **`public`**.
5. Root directory: repository root (default).
6. Deploy. The project gets a `*.pages.dev` URL. GitHub pushes to `main` update the preview automatically.

The `public/_headers` and `public/robots.txt` files instruct search engines not to index the client test site. This **does not password-protect the site**.

## Evaluation-only limitations

- Browser-local data (localStorage and IndexedDB). Each browser has its own independent version of curriculum, bookmarks, notes and assessment history; data does **not** synchronize between clients.
- Roles are simulated, **not secure accounts**. Do not use real student information, credentials, payment details, or confidential content.
- Uploaded files and content may be lost if users clear site data; export a backup using the portal tools.
- Supabase, live donations, and secure multi-user access are not connected.

## File structure

- `public/index.html`: single-page app entry
- `public/app.js`: app UI and state
- `public/styles.css`: styling
- `public/local-media.js`: local media storage utilities
- `public/_headers`: Cloudflare Pages response headers
- `public/robots.txt`: crawler exclusion request

No npm installation or build step required.
# Tiphia Frontend

This repository contains the TiphiaPress frontend shell: the admin console, public blog runtime skeleton, frontend plugin runtime, i18n runtime, and theme loading conventions.

## Documentation

Full documentation:

https://tiphiapress.github.io/

Useful sections:

- Frontend hooks: https://tiphiapress.github.io/#/frontend-hooks
- Theme development: https://tiphiapress.github.io/#/themes
- API reference: https://tiphiapress.github.io/#/api
- Deployment guide: https://tiphiapress.github.io/#/deployment

## Repository Role

This frontend is intentionally decoupled from the backend. The backend is deployed from `TiphiaPress/tiphia`; this app is built as static assets and can be deployed to any static hosting provider.

```text
src/admin/       Admin console pages, components, and admin-owned assets
src/blog/        Public blog runtime skeleton: routes, data fetching, SEO, mutations
src/framework/   Plugin hooks, i18n, public API helpers
src/plugins/     Frontend plugin packages, including plugin-owned assets and config UI
src/themes/      Theme packages: public rendering, views, CSS, favicon, theme-owned assets
```

There is intentionally no `public/` asset convention. Plugin files belong in their plugin package, and theme files belong in their theme package.

## Development

```bash
yarn install
yarn dev
```

Default local URL:

```text
http://127.0.0.1:5173
```

Admin console:

```text
http://127.0.0.1:5173/admin
```

API base configuration in `.env`:

```bash
# Empty means same-origin requests, for example /api/v1/auth/status.
# This is recommended for Nginx static deployment with /api/ reverse proxy.
VITE_TIPHIA_API_BASE=

# Use this only when the API is on another origin.
# VITE_TIPHIA_API_BASE=https://api.example.com
```

For runtime-only changes without rebuilding, define `window.__TIPHIA_API_BASE__` before the bundled app script in `index.html`.

## Build

```bash
yarn build
```

The output is `dist/` and can be hosted by Nginx, GitHub Pages, Cloudflare Pages, Vercel, or any static server.

## Themes

Themes are frontend source modules. The default theme can be copied from `TiphiaPress/tiphia-default-themes` or linked into `src/themes/default` as a Git submodule.

A theme should keep all assets in its own directory:

```text
src/themes/my-theme/
  index.tsx
  views.tsx
  theme.css
  favicon.ico
  README.md
```

The active theme's favicon is imported from the theme module registry, not from a global static folder.

## Frontend Plugins

Frontend plugins register React hook contributions through `registerFrontendPlugin`. They can provide admin configuration panels, head effects, i18n resources, and blog/admin UI insertions.

A plugin should keep all frontend files in its own package:

```text
src/plugins/my-plugin/
  index.tsx
  ConfigPanel.tsx
  styles.css
  README.md
```

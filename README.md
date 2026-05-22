# Tiphia Frontend

This repository contains the TiphiaPress frontend shell: the admin console, public blog routes, frontend plugin runtime, i18n runtime, and theme loading conventions.

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
src/admin/       Admin console pages and components
src/blog/        Public blog routes and content components
src/framework/   Plugin hooks, i18n, public API helpers
src/plugins/     Frontend plugin packages
src/themes/      Theme packages; default may be linked from tiphia-default-themes
public/themes/   Theme static files such as /themes/default/favicon.ico
```

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

Set the backend API base in `.env`:

```bash
VITE_TIPHIA_API_BASE=http://127.0.0.1:3000
```

## Build

```bash
yarn build
```

The output is `dist/` and can be hosted by Nginx, GitHub Pages, Cloudflare Pages, Vercel, or any static server.

## Themes

Themes are frontend modules. The default theme can be copied from `TiphiaPress/tiphia-default-themes` or linked into `src/themes/default` as a Git submodule.

Theme favicon files are read from:

```text
/themes/{themeName}/favicon.ico
```

For the default theme, place the file at:

```text
public/themes/default/favicon.ico
```

## Frontend Plugins

Frontend plugins register React hook contributions through `registerFrontendPlugin`. They can provide admin configuration panels, head effects, i18n resources, and blog/admin UI insertions.

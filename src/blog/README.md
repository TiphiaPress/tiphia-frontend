# Blog Skeleton Source Layout

`src/blog` is the public blog runtime skeleton. It should fetch data, own route-level state, call SEO hooks, run mutations, and then hand data to the active theme through `useActiveThemeViews()`.

It should not contain public blog markup, theme class names, or CSS. Public rendering belongs in `src/themes/{themeName}`.

## Responsibilities

- `App.tsx`: query client and public route table only.
- `components/Layout.tsx`: loads site settings and renders the active theme layout.
- `pages/`: route data containers. They read route params, fetch API data, call `useSeo`, and render theme views.
- `features/`: stateful public features such as comments. Keep data/mutation logic here, but render through theme views.
- `hooks/`: reusable runtime hooks such as active theme lookup, SEO, and remembered comment identity.
- `lib/`: API client and framework-neutral helpers.
- `types.ts`: API-facing TypeScript contracts shared by themes and plugins.

## Theme Boundary

Themes implement the public UI contract declared in `src/themes/types.ts`:

- layout shell
- home view
- article and page views
- category/tag views
- timeline view
- register view
- comments and comment form views
- state and widget views
- external warning view

If a new public route needs UI, add a typed theme view first, then make the route container pass data into that view.

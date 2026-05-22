# Legacy Static Theme Assets

This directory is only for static files that must be copied as-is by Vite.
Theme packages should live under `frontend/src/themes/<theme-name>`:

```text
frontend/src/themes/my-theme/
  index.tsx
  theme.css
  README.md
```

Use this public folder only for files that must be served directly by URL, such
as images or downloadable assets.

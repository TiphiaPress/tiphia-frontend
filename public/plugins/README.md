# Legacy Static Plugin Assets

This directory is only for static files that must be copied as-is by Vite.
Frontend plugin packages should live under `frontend/src/plugins/<plugin-name>`:

```text
frontend/src/plugins/tiphia-plugin-example/
  index.tsx
  ConfigPanel.tsx
  README.md
```

Backend plugin code still lives under the repository `plugins/` workspace. A
plugin author may ship two source folders:

- backend: copy into `plugins/<plugin-name>/`
- frontend: copy into `frontend/src/plugins/<plugin-name>/`

The bundled frontend plugins currently provide:

- `tiphia-links`
- `tiphia-filing`
- `tiphia-geetest`

Use this public folder only for plugin files that must be served directly by URL.

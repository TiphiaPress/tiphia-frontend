# Blog Frontend Source Layout

This frontend is intended to be a reference theme template. Keep page-level code,
reusable UI, and integration helpers separated:

- `App.tsx`: query client and route table only.
- `pages/`: route-level screens.
- `components/`: reusable presentational or integration components.
- `features/`: larger domain features, such as comments.
- `hooks/`: reusable React hooks.
- `lib/`: framework-agnostic helpers and API clients.
- `types.ts`: API-facing TypeScript contracts.
- `types/`: global ambient types for browser SDKs.

When creating a new theme, start by replacing files in `pages/` and
`components/`. Keep `lib/api.ts`, shared hooks, and API contract types stable
unless the backend contract changes.

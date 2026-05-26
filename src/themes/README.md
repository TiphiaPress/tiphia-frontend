# Themes

Themes are compile-time source packages, not loose public files. Each theme lives in its own folder and is automatically loaded by `src/themes/index.ts` when it provides an `index.ts` or `index.tsx` entry that exports a `BlogTheme` object.

```text
src/themes/my-theme/
  index.tsx
  theme.css
  favicon.ico
  README.md
  components/
  views/
```

You no longer need to edit `src/themes/index.ts` for each new theme. The loader uses:

```ts
import.meta.glob(["./*/index.ts", "./*/index.tsx"], { eager: true });
```

## Theme entry

A theme should default export a `BlogTheme` object:

```tsx
import type { BlogTheme } from "../types";
import { Layout } from "./Layout";
import { views } from "./views";
import faviconUrl from "./favicon.ico";
import "./theme.css";

const theme: BlogTheme = {
  name: "my-theme",
  faviconUrl,
  Layout,
  views,
};

export default theme;
```

`name` is the value saved in site settings as the active theme.

## Hook slots

The frontend skeleton provides plugin hook APIs from `src/framework/plugin-hooks.tsx`. A theme decides where hook slots appear:

```tsx
<FrontendHookSlot hook="blog.post.content.after" context={{ post }} />
```

A theme does not decide what is inserted into the slot. Frontend plugins register that content.

## Assets

Keep theme assets inside the theme directory. Theme favicon should live in the theme folder and be imported by the theme entry. Do not put theme-owned files in `public/`.
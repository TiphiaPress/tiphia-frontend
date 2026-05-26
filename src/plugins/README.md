# Frontend Plugins

Frontend plugins are compile-time source packages. Each plugin lives in its own folder and is automatically loaded by `src/plugins/index.ts` when it provides an `index.ts` or `index.tsx` entry.

```text
src/plugins/my-plugin/
  index.tsx
  ConfigPanel.tsx
  styles.css
```

You no longer need to edit `src/plugins/index.ts` for each new plugin. The loader uses:

```ts
import.meta.glob(["./*/index.ts", "./*/index.tsx"], { eager: true });
```

So the only requirement is: put the plugin entry at `src/plugins/<plugin-name>/index.tsx` or `index.ts`.

## Basic plugin

Register the plugin from `index.tsx`:

```tsx
import { registerFrontendPlugin } from "../../framework/plugin-hooks";
import { ConfigPanel } from "./ConfigPanel";
import "./styles.css";

registerFrontendPlugin({
  name: "my-plugin",
  backendNames: ["my-plugin"],
  adminConfigPanel: ConfigPanel,
  hooks: [
    {
      hook: "blog.footer.before",
      order: 50,
      render: (context) => <div>{String(context.title)}</div>,
    },
  ],
});
```

## i18n packages

A plugin can be only a language pack. It does not need hooks or backend APIs:

```tsx
import { registerFrontendPlugin } from "../../framework/plugin-hooks";

registerFrontendPlugin({
  name: "tiphia-language-ja",
  i18n: {
    locales: [{ code: "ja-JP", label: "日本語" }],
    resources: {
      "ja-JP": {
        "nav.dashboard": "ダッシュボード",
        "action.save": "保存",
      },
    },
  },
});
```

Plugin messages override the same locale/key in the core dictionary, so normal plugins can ship their own admin panel translations next to their components.

## Head effects

Plugins can register head side effects:

```tsx
registerFrontendPlugin({
  name: "my-plugin",
  head: [
    {
      id: "my-plugin-head",
      run: () => {
        const script = document.createElement("script");
        script.src = "https://example.com/sdk.js";
        document.head.appendChild(script);
        return () => script.remove();
      },
    },
  ],
});
```

Keep assets, styles and config panels inside the plugin directory. Do not put plugin-owned files in `public/`.
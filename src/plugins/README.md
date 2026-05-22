# Frontend Plugins

Each frontend plugin lives in its own folder:

```text
src/plugins/my-plugin/
  index.tsx
  ConfigPanel.tsx
  styles.css
```

Register the plugin from `index.tsx`:

```tsx
import { registerFrontendPlugin } from "../framework/plugin-hooks";

registerFrontendPlugin({
  name: "my-plugin",
  adminConfigPanel: ConfigPanel,
  i18n: {
    locales: [
      { code: "ja-JP", label: "日本語" },
    ],
    resources: {
      "zh-CN": {
        "my_plugin.title": "我的插件",
      },
      "en-US": {
        "my_plugin.title": "My plugin",
      },
      "ja-JP": {
        "my_plugin.title": "私のプラグイン",
      },
    },
  },
  hooks: [
    {
      hook: "blog.footer.before",
      order: 50,
      render: (context) => <div>{String(context.title)}</div>,
    },
  ],
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

Then import it from `src/plugins/index.ts`.

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

Plugin messages override the same locale/key in the core dictionary, so normal
plugins can ship their own admin panel translations next to their components.

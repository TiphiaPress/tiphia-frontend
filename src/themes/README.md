# Themes

Themes are source packages, not loose public files:

```text
src/themes/default/
  index.tsx
  theme.css
  README.md
```

The frontend skeleton provides plugin hook APIs from
`src/framework/plugin-hooks.tsx`. A theme decides where hook slots appear:

```tsx
<FrontendHookSlot hook="blog.post.content.after" context={{ post }} />
```

A theme does not decide what is inserted into the slot. Frontend plugins register
that content.

# Default Theme

The default theme owns the public blog shell and chooses where plugin hook slots
are rendered.

Theme config can provide a browser tab icon with either `favicon_url` or
`favicon`:

```json
{
  "favicon_url": "/themes/default/favicon.ico"
}
```

If this value is omitted, the app falls back to `/favicon.ico`.

Available slots used by this theme:

- `blog.header.before`
- `blog.header.after`
- `blog.nav.after`
- `blog.main.before`
- `blog.main.after`
- `blog.footer.before`
- `blog.footer.after`
- `blog.home.hero.after`
- `blog.post.content.after`
- `blog.comment.form.before`
- `blog.comment.form.after`

Theme authors can add or remove slots in their own theme. The frontend skeleton
defines the hook interface; plugins decide what to register into each slot.

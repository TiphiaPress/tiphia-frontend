import { registerFrontendPlugin } from "../../framework/plugin-hooks";
import { HighlightConfigPanel } from "./HighlightConfigPanel";
import { enhanceCodeBlocks } from "./runtime";
import "./highlight.css";

registerFrontendPlugin({
  name: "tiphia-highlight",
  adminConfigPanel: HighlightConfigPanel,
  hooks: [
    {
      hook: "blog.post.content.after",
      order: 30,
      render: () => null,
    },
    {
      hook: "blog.custom-page.after",
      order: 30,
      render: () => null,
    },
  ],
  head: [
    {
      id: "tiphia-highlight-runtime",
      order: 40,
      run: () => enhanceCodeBlocks(),
    },
  ],
});

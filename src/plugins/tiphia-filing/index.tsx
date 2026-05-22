import { registerFrontendPlugin } from "../../framework/plugin-hooks";
import { FilingFooter } from "./FilingFooter";
import { FilingConfigPanel } from "./FilingConfigPanel";

registerFrontendPlugin({
  name: "tiphia-filing",
  adminConfigPanel: FilingConfigPanel,
  hooks: [
    {
      hook: "blog.footer.filing",
      order: 20,
      render: () => <FilingFooter />,
    },
  ],
});

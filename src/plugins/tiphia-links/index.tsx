import { registerFrontendPlugin } from "../../framework/plugin-hooks";
import { LinksPageContent } from "./FriendLinks";
import { LinksConfigPanel } from "./LinksConfigPanel";

registerFrontendPlugin({
  name: "tiphia-links",
  backendNames: ["tiphia-plugin-links"],
  adminConfigPanel: LinksConfigPanel,
  hooks: [
    {
      hook: "blog.custom-page.links",
      order: 20,
      render: () => <LinksPageContent />,
    },
  ],
});
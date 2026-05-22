import { registerFrontendPlugin } from "../../framework/plugin-hooks";
import { GeetestHookBox } from "./GeetestBox";
import { GeetestConfigPanel } from "./GeetestConfigPanel";

registerFrontendPlugin({
  name: "tiphia-geetest",
  adminConfigPanel: GeetestConfigPanel,
  hooks: [
    {
      hook: "admin.auth.captcha",
      order: 20,
      render: (context) => <GeetestHookBox mode={context.mode === "register" ? "register" : "login"} onVerify={onVerify(context)} />,
    },
    {
      hook: "blog.auth.register.captcha",
      order: 20,
      render: (context) => <GeetestHookBox mode="register" onVerify={onVerify(context)} />,
    },
    {
      hook: "blog.comment.captcha",
      order: 20,
      render: (context) => <GeetestHookBox mode="comment" onVerify={onVerify(context)} />,
    },
  ],
  head: [
    {
      id: "geetest-script-preconnect",
      order: 20,
      run: () => {
        const id = "tiphia-geetest-preconnect";
        if (document.getElementById(id)) {
          return;
        }
        const link = document.createElement("link");
        link.id = id;
        link.rel = "preconnect";
        link.href = "https://static.geetest.com";
        document.head.appendChild(link);
        return () => link.remove();
      },
    },
  ],
});

function onVerify(context: Record<string, unknown>) {
  return typeof context.onVerify === "function"
    ? (context.onVerify as (value: Record<string, unknown> | null) => void)
    : undefined;
}

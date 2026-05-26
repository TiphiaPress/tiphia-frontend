import { registerFrontendPlugin } from "../../framework/plugin-hooks";
import { CommentMailPushConfigPanel } from "./CommentMailPushConfigPanel";
import { PasswordRecoveryEntry } from "./PasswordRecoveryEntry";
import { PasswordResetPage } from "./PasswordResetPage";
import "./styles.css";

registerFrontendPlugin({
  name: "tiphia-comment-mail-push",
  backendNames: ["tiphia-comment-mail-push", "tiphia-plugin-comment-mail-push"],
  adminConfigPanel: CommentMailPushConfigPanel,
  routes: [
    {
      path: "/password-reset",
      element: <PasswordResetPage />,
    },
  ],
  hooks: [
    {
      hook: "admin.auth.form.after",
      order: 80,
      render: (context) => <PasswordRecoveryEntry mode={String(context.mode || "login")} />,
    },
  ],
});

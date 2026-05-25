import { registerFrontendPlugin } from "../../framework/plugin-hooks";
import { AuthenticatorConfigPanel } from "./AuthenticatorConfigPanel";
import { TotpLoginField } from "./TotpLoginField";

registerFrontendPlugin({
  name: "tiphia-authenticator",
  adminConfigPanel: AuthenticatorConfigPanel,
  hooks: [
    {
      hook: "admin.auth.form.after",
      order: 30,
      render: (context) => <TotpLoginField onChange={onTotpChange(context)} />,
    },
  ],
});

function onTotpChange(context: Record<string, unknown>) {
  return typeof context.onTotpChange === "function"
    ? (context.onTotpChange as (value: string) => void)
    : undefined;
}
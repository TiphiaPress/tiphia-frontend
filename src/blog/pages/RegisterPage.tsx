import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useActiveThemeViews } from "../hooks/useActiveThemeViews";
import { useSeo } from "../hooks/useSeo";
import { api } from "../lib/api";
import { absoluteUrl } from "../lib/url";

export function RegisterPage() {
  const { Register } = useActiveThemeViews();
  const settings = useQuery({ queryKey: ["settings"], queryFn: api.settings });
  const authStatus = useQuery({ queryKey: ["auth-status"], queryFn: api.authStatus });
  const geetest = useQuery({ queryKey: ["geetest-config"], queryFn: api.geetestConfig, retry: false });
  const [form, setForm] = useState({ username: "", email: "", display_name: "", password: "" });
  const [captcha, setCaptcha] = useState<Record<string, unknown> | null>(null);
  const captchaRequired = Boolean(geetest.data?.enabled && geetest.data.verify_register);
  const register = useMutation({
    mutationFn: () => api.register({
      username: form.username,
      email: form.email,
      password: form.password,
      display_name: form.display_name || null,
      captcha,
      extensions: captcha ? { "tiphia-geetest": captcha } : {},
    }),
    onError: () => setCaptcha(null),
  });
  useSeo({
    title: "注册",
    description: "注册站点账号",
    siteTitle: settings.data?.title,
    suffix: settings.data?.seo.meta_title_suffix,
    canonical: absoluteUrl(settings.data?.base_url, "/register"),
  });

  const registrationEnabled = authStatus.data?.registration_enabled ?? settings.data?.registration_enabled;

  return (
    <Register
      registrationEnabled={registrationEnabled}
      form={form}
      onFormChange={setForm}
      onSubmit={() => {
        if (captchaRequired && !captcha) {
          register.reset();
          return;
        }
        register.mutate();
      }}
      pending={register.isPending}
      error={register.error}
      success={register.isSuccess}
      captchaRequired={captchaRequired}
      captcha={captcha}
      onCaptcha={setCaptcha}
    />
  );
}

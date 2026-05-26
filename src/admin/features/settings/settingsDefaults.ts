import type { SiteSettings } from "../../types";

export const defaultSiteSettings: SiteSettings = {
  title: "Tiphia",
  description: "A Rust blog powered by Tiphia.",
  avatar_url: "",
  gravatar_base_url: "https://www.gravatar.com/avatar/",
  base_url: "",
  timezone: "UTC",
  default_page_size: 20,
  comments_enabled: true,
  comment_moderation: true,
  registration_enabled: false,
  permalink_format: "/posts/{slug}",
  theme: {
    active: "default",
    configs: {},
    config: {},
    configs_migrated: true,
  },
  seo: {
    meta_title_suffix: "Tiphia",
    meta_description: "A Rust blog powered by Tiphia.",
  },
};

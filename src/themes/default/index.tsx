import { Link, NavLink, Outlet } from "react-router-dom";
import { FrontendHookSlot, useFrontendHeadEffects } from "../../framework/plugin-hooks";
import { externalWarningPath, shouldWarnExternalLink } from "./externalLinks";
import type { TermResponse } from "../../blog/types";
import { SiteAvatar } from "../../blog/components/SiteAvatar";
import { TermLinks } from "../../blog/components/TermLinks";
import type { ThemeNavPage } from "../../blog/lib/theme";
import "./theme.css";

export interface DefaultThemeLayoutProps {
  title: string;
  description?: string | null;
  avatarUrl?: string | null;
  baseUrl?: string | null;
  registrationEnabled?: boolean;
  navPages: ThemeNavPage[];
  terms: TermResponse[];
}

export function DefaultThemeLayout({
  title,
  description,
  avatarUrl,
  baseUrl,
  registrationEnabled,
  navPages,
  terms,
}: DefaultThemeLayoutProps) {
  useFrontendHeadEffects({ title, description, baseUrl });

  return (
    <div
      className="site default-theme"
      onClick={(event) => {
        const anchor = (event.target as HTMLElement).closest("a");
        if (!anchor || event.defaultPrevented) {
          return;
        }
        if (shouldWarnExternalLink(anchor, baseUrl)) {
          event.preventDefault();
          window.location.assign(externalWarningPath(anchor.href));
        }
      }}
    >
      <FrontendHookSlot hook="blog.body.start" context={{ title }} />
      <FrontendHookSlot hook="blog.header.before" context={{ title }} />
      <header className="site-header">
        <Link to="/" className="site-title">
          <SiteAvatar avatarUrl={avatarUrl} baseUrl={baseUrl} title={title} size="small" />
          {title}
        </Link>
        <nav>
          <NavLink to="/categories">分类</NavLink>
          <NavLink to="/tags">标签</NavLink>
          <NavLink to="/timeline">时间线</NavLink>
          {registrationEnabled ? <NavLink to="/register">注册</NavLink> : null}
          {navPages.map((page) => (
            <NavLink key={page.slug} to={`/custom-pages/${page.slug}`}>
              {page.label}
            </NavLink>
          ))}
          <FrontendHookSlot hook="blog.nav.after" context={{ navPages }} />
        </nav>
      </header>
      <FrontendHookSlot hook="blog.header.after" context={{ title }} />
      <FrontendHookSlot hook="blog.main.before" context={{ title }} />
      <main>
        <Outlet />
      </main>
      <FrontendHookSlot hook="blog.sidebar" context={{ title }} />
      <FrontendHookSlot hook="blog.main.after" context={{ title }} />
      <footer>
        <FrontendHookSlot hook="blog.footer.before" context={{ title }} />
        <TermLinks terms={terms} showType />
        <FrontendHookSlot hook="blog.footer.filing" context={{ title }} />
        <FrontendHookSlot hook="blog.footer.after" context={{ title }} />
      </footer>
      <FrontendHookSlot hook="blog.body.end" context={{ title }} />
    </div>
  );
}

export { FrontendHookSlot };

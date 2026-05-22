import {
  BookOpen,
  Boxes,
  FileText,
  LayoutDashboard,
  Github,
  LogOut,
  MessageSquare,
  Palette,
  Settings,
  Tags,
  Users,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearSession, getStoredUser } from "../lib/auth";
import { adminPath } from "../lib/routes";
import { FrontendHookSlot } from "../../framework/plugin-hooks";
import { useI18n } from "../../framework/i18n";
import { Brand } from "./Brand";

const PROJECT_REPOSITORY_URL = "https://github.com/TiphiaPress/tiphia";

const links = [
  { to: adminPath(), label: "总览", icon: LayoutDashboard },
  { to: adminPath("/posts"), label: "文章", icon: FileText },
  { to: adminPath("/pages"), label: "页面", icon: BookOpen },
  { to: adminPath("/comments"), label: "评论", icon: MessageSquare },
  { to: adminPath("/terms"), label: "分类标签", icon: Tags },
  { to: adminPath("/users"), label: "用户", icon: Users },
  { to: adminPath("/plugins"), label: "插件", icon: Boxes },
  { to: adminPath("/themes"), label: "主题", icon: Palette },
  { to: adminPath("/settings"), label: "设置", icon: Settings },
];

export function Shell() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const { locale, locales, setLocale, t } = useI18n();

  function logout() {
    clearSession();
    navigate(adminPath("/login"));
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Brand subtitle="Admin Console" />
        <nav>
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink key={link.to} to={link.to} end={link.to === adminPath()}>
                <Icon size={18} />
                {t(`nav.${link.to === adminPath() ? "dashboard" : link.to.split("/").pop()}`, link.label)}
              </NavLink>
            );
          })}
          <FrontendHookSlot hook="admin.sidebar.nav.after" context={{ user }} />
        </nav>
      </aside>
      <main className="main">
        <header className="topbar">
          <select
            className="locale-select"
            value={locale}
            onChange={(event) => setLocale(event.target.value as never)}
            title="Language"
          >
            {locales.map((item) => (
              <option key={item.code} value={item.code}>
                {item.label}
              </option>
            ))}
          </select>
          <FrontendHookSlot hook="admin.topbar.after" context={{ user }} />
          <div>
            <strong>{user?.display_name || user?.username || "Administrator"}</strong>
            <span>{user?.role || "admin"}</span>
          </div>
          <button className="icon-button" onClick={logout} title={t("action.logout")}>
            <LogOut size={18} />
          </button>
        </header>
        <div className="main-content"><Outlet /></div>
        <footer className="admin-footer">
          <a href={PROJECT_REPOSITORY_URL} target="_blank" rel="noreferrer">
            <Github size={16} />
            GitHub: TiphiaPress/tiphia
          </a>
        </footer>
      </main>
    </div>
  );
}

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { I18nProvider } from "../framework/i18n";
import { RequireAuth } from "../admin/components/RequireAuth";
import { Shell as AdminShell } from "../admin/components/Shell";
import { ToastProvider } from "../admin/components/Toast";
import { Comments as AdminComments } from "../admin/pages/Comments";
import { ContentEditor } from "../admin/pages/ContentEditor";
import { ContentList } from "../admin/pages/ContentList";
import { Dashboard } from "../admin/pages/Dashboard";
import { Login } from "../admin/pages/Login";
import { PluginConfig, Plugins } from "../admin/pages/Plugins";
import { SettingsPage } from "../admin/pages/Settings";
import { Terms as AdminTerms } from "../admin/pages/Terms";
import { ThemeConfig, Themes } from "../admin/pages/Themes";
import { Users } from "../admin/pages/Users";
import { Layout as BlogLayout } from "../blog/components/Layout";
import { Home } from "../blog/pages/Home";
import { CustomPageDetail, PageDetail, PostDetail } from "../blog/pages/PostPages";
import { RegisterPage } from "../blog/pages/RegisterPage";
import { TermArchive, TermDirectory } from "../blog/pages/Terms";
import { Timeline } from "../blog/pages/Timeline";
import { ExternalWarningPage } from "../blog/pages/ExternalWarningPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function UnifiedApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin" element={<RequireAuth />}>
              <Route element={<AdminShell />}>
                <Route index element={<Dashboard />} />
                <Route path="posts" element={<ContentList type="post" />} />
                <Route path="posts/new" element={<ContentEditor type="post" />} />
                <Route path="posts/:id/edit" element={<ContentEditor type="post" />} />
                <Route path="pages" element={<ContentList type="page" />} />
                <Route path="pages/new" element={<ContentEditor type="page" />} />
                <Route path="pages/:id/edit" element={<ContentEditor type="page" />} />
                <Route path="comments" element={<AdminComments />} />
                <Route path="terms" element={<AdminTerms />} />
                <Route path="users" element={<Users />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="plugins" element={<Plugins />} />
                <Route path="plugins/:name/config" element={<PluginConfig />} />
                <Route path="themes" element={<Themes />} />
                <Route path="themes/:name/config" element={<ThemeConfig />} />
              </Route>
            </Route>
            <Route path="/" element={<BlogLayout />}>
              <Route index element={<Home />} />
              <Route path="categories" element={<TermDirectory type="category" />} />
              <Route path="tags" element={<TermDirectory type="tag" />} />
              <Route path="timeline" element={<Timeline />} />
              <Route path="external-warning" element={<ExternalWarningPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="posts/:slug" element={<PostDetail />} />
              <Route path="pages/:slug" element={<PageDetail />} />
              <Route path="custom-pages/:slug" element={<CustomPageDetail />} />
              <Route path="terms/:id" element={<TermArchive />} />
            </Route>
            <Route path="/login" element={<Navigate to="/admin/login" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}

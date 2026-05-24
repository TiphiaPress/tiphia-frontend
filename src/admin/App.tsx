import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { I18nProvider } from "../framework/i18n";
import { RequireAuth } from "./components/RequireAuth";
import { RedirectToAllowedAdminPage, RequirePermission } from "./components/RequirePermission";
import { Shell } from "./components/Shell";
import { ToastProvider } from "./components/Toast";
import { Comments } from "./pages/Comments";
import { ContentEditor } from "./pages/ContentEditor";
import { ContentList } from "./pages/ContentList";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { PluginConfig, Plugins } from "./pages/Plugins";
import { SettingsPage } from "./pages/Settings";
import { Terms } from "./pages/Terms";
import { ThemeConfig, Themes } from "./pages/Themes";
import { Users } from "./pages/Users";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<RequireAuth />}>
                <Route element={<Shell />}>
                  <Route index element={<RequirePermission section="dashboard"><Dashboard /></RequirePermission>} />
                  <Route path="/posts" element={<RequirePermission section="posts"><ContentList type="post" /></RequirePermission>} />
                  <Route path="/posts/new" element={<RequirePermission section="posts"><ContentEditor type="post" /></RequirePermission>} />
                  <Route path="/posts/:id/edit" element={<RequirePermission section="posts"><ContentEditor type="post" /></RequirePermission>} />
                  <Route path="/pages" element={<RequirePermission section="pages"><ContentList type="page" /></RequirePermission>} />
                  <Route path="/pages/new" element={<RequirePermission section="pages"><ContentEditor type="page" /></RequirePermission>} />
                  <Route path="/pages/:id/edit" element={<RequirePermission section="pages"><ContentEditor type="page" /></RequirePermission>} />
                  <Route path="/comments" element={<RequirePermission section="comments"><Comments /></RequirePermission>} />
                  <Route path="/terms" element={<RequirePermission section="terms"><Terms /></RequirePermission>} />
                  <Route path="/users" element={<RequirePermission section="users"><Users /></RequirePermission>} />
                  <Route path="/settings" element={<RequirePermission section="settings"><SettingsPage /></RequirePermission>} />
                  <Route path="/plugins" element={<RequirePermission section="plugins"><Plugins /></RequirePermission>} />
                  <Route path="/plugins/:name/config" element={<RequirePermission section="plugins"><PluginConfig /></RequirePermission>} />
                  <Route path="/themes" element={<RequirePermission section="themes"><Themes /></RequirePermission>} />
                  <Route path="/themes/:name/config" element={<RequirePermission section="themes"><ThemeConfig /></RequirePermission>} />
                </Route>
              </Route>
              <Route path="*" element={<RedirectToAllowedAdminPage />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}
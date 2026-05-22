import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { I18nProvider } from "../framework/i18n";
import { RequireAuth } from "./components/RequireAuth";
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
                <Route index element={<Dashboard />} />
                <Route path="/posts" element={<ContentList type="post" />} />
                <Route path="/posts/new" element={<ContentEditor type="post" />} />
                <Route path="/posts/:id/edit" element={<ContentEditor type="post" />} />
                <Route path="/pages" element={<ContentList type="page" />} />
                <Route path="/pages/new" element={<ContentEditor type="page" />} />
                <Route path="/pages/:id/edit" element={<ContentEditor type="page" />} />
                <Route path="/comments" element={<Comments />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/users" element={<Users />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/plugins" element={<Plugins />} />
                <Route path="/plugins/:name/config" element={<PluginConfig />} />
                <Route path="/themes" element={<Themes />} />
                <Route path="/themes/:name/config" element={<ThemeConfig />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </BrowserRouter>
        </ToastProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}

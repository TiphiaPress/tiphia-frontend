import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { I18nProvider } from "../framework/i18n";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { RegisterPage } from "./pages/RegisterPage";
import { TermArchive, TermDirectory } from "./pages/Terms";
import { Timeline } from "./pages/Timeline";
import { CustomPageDetail, PageDetail, PostDetail } from "./pages/PostPages";
import { ExternalWarningPage } from "./pages/ExternalWarningPage";
import { NotFoundPage, NotFoundRedirect } from "./pages/NotFound";

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
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="categories" element={<TermDirectory type="category" />} />
              <Route path="tags" element={<TermDirectory type="tag" />} />
              <Route path="timeline" element={<Timeline />} />
              <Route path="external-warning" element={<ExternalWarningPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="posts/:slug" element={<PostDetail />} />
              <Route path="pages/:slug" element={<PageDetail />} />
              <Route path="custom-pages/:slug" element={<CustomPageDetail />} />
              <Route path="links" element={<CustomPageDetail fixedSlug="links" />} />
              <Route path="terms/:id" element={<TermArchive />} />
              <Route path="404" element={<NotFoundPage />} />
              <Route path="*" element={<NotFoundRedirect />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </I18nProvider>
    </QueryClientProvider>
  );
}

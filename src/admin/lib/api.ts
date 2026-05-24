export { ApiError, apiBase } from "./api/client";

import { authApi } from "./api/auth";
import { commentsApi } from "./api/comments";
import { contentApi } from "./api/content";
import { pluginsApi } from "./api/plugins";
import { settingsApi } from "./api/settings";
import { systemApi } from "./api/system";
import { termsApi } from "./api/terms";
import { usersApi } from "./api/users";

export const api = {
  ...systemApi,
  ...authApi,
  ...contentApi,
  ...commentsApi,
  ...termsApi,
  ...settingsApi,
  ...usersApi,
  ...pluginsApi,
};

export type AdminApi = typeof api;

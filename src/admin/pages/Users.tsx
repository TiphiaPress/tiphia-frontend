import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Empty, ErrorState, Loading } from "../components/Status";
import { useToast } from "../components/Toast";
import { useI18n } from "../../framework/i18n";
import { api } from "../lib/api";
import { getStoredUser } from "../lib/auth";
import type { UserRole, UserStatus } from "../types";

export function Users() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useI18n();
  const currentUser = getStoredUser();
  const isRoot = currentUser?.role === "root";
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    display_name: "",
    role: "author" as UserRole,
  });
  const query = useQuery({
    queryKey: ["users"],
    queryFn: () => api.listUsers({ page: 1, per_page: 50 }),
  });
  const create = useMutation({
    mutationFn: () => api.createUser(form),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(t("users.created"));
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t("users.create_failed"));
    },
  });
  const update = useMutation({
    mutationFn: ({ id, status }: { id: number; status: UserStatus }) => api.updateUser(id, { status }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(t("users.status_updated"));
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t("users.status_failed"));
    },
  });

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1>{t("users.title")}</h1>
          <p>{t("users.subtitle")}</p>
        </div>
      </div>
      <div className="split-grid">
        <section className="panel">
          <h2>{t("users.new")}</h2>
          <form
            className="form-grid"
            onSubmit={(event) => {
              event.preventDefault();
              create.mutate();
            }}
          >
            <label className="field">
              <span>{t("users.username")}</span>
              <input value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} />
            </label>
            <label className="field">
              <span>{t("users.email")}</span>
              <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            </label>
            <label className="field">
              <span>{t("users.display_name")}</span>
              <input value={form.display_name} onChange={(event) => setForm({ ...form, display_name: event.target.value })} />
            </label>
            <label className="field">
              <span>{t("users.password")}</span>
              <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
            </label>
            <label className="field">
              <span>{t("users.role")}</span>
              <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as UserRole })}>
                <option value="author">{t("users.role_author")}</option>
                <option value="editor">{t("users.role_editor")}</option>
                {isRoot ? <option value="admin">{t("users.role_admin")}</option> : null}
                {isRoot ? <option value="root">{t("users.role_root")}</option> : null}
              </select>
            </label>
            {create.error ? <p className="error-text">{create.error.message}</p> : null}
            <button type="submit">
              <Plus size={16} />
              {t("action.create")}
            </button>
          </form>
        </section>
        <section className="panel wide">
          <h2>{t("users.list")}</h2>
          {query.isLoading ? <Loading /> : null}
          {query.error ? <ErrorState error={query.error} /> : null}
          {query.data?.data.length === 0 ? <Empty /> : null}
          {query.data?.data.map((user) => (
            <div className="list-row" key={user.id}>
              <div>
                <strong>{user.display_name}</strong>
                <small>{user.username} · {user.email} · {user.role}</small>
              </div>
              {currentUser?.id === user.id ? <small>{t("users.cannot_disable_self")}</small> : null}
              <button
                className="button subtle"
                disabled={currentUser?.id === user.id}
                onClick={() => update.mutate({ id: user.id, status: user.status === "active" ? "disabled" : "active" })}
              >
                {user.status === "active" ? t("action.disable") : t("action.enable")}
              </button>
            </div>
          ))}
        </section>
      </div>
    </section>
  );
}

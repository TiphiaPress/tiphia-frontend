import { Edit3 } from "lucide-react";
import { Link } from "react-router-dom";
import type { PostResponse } from "../../types";

interface ContentTableProps {
  posts: PostResponse[];
  selectedIds: number[];
  basePath: string;
  onSelectedIdsChange: (updater: (current: number[]) => number[]) => void;
  t: (key: string, fallback?: string, vars?: Record<string, string | number>) => string;
}

export function ContentTable({ posts, selectedIds, basePath, onSelectedIdsChange, t }: ContentTableProps) {
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>
            <input
              type="checkbox"
              checked={posts.every((post) => selectedIds.includes(post.id))}
              onChange={(event) => {
                onSelectedIdsChange(() => (event.target.checked ? posts.map((post) => post.id) : []));
              }}
            />
          </th>
          <th>{t("content.title")}</th>
          <th>Slug</th>
          <th>{t("content.status")}</th>
          <th>{t("content.updated_at")}</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {posts.map((post) => (
          <ContentRow
            key={post.id}
            post={post}
            selected={selectedIds.includes(post.id)}
            basePath={basePath}
            onSelect={(selected) => {
              onSelectedIdsChange((current) => selected ? [...current, post.id] : current.filter((id) => id !== post.id));
            }}
            t={t}
          />
        ))}
      </tbody>
    </table>
  );
}

function ContentRow({
  post,
  selected,
  basePath,
  onSelect,
  t,
}: {
  post: PostResponse;
  selected: boolean;
  basePath: string;
  onSelect: (selected: boolean) => void;
  t: (key: string, fallback?: string, vars?: Record<string, string | number>) => string;
}) {
  return (
    <tr>
      <td>
        <input type="checkbox" checked={selected} onChange={(event) => onSelect(event.target.checked)} />
      </td>
      <td>
        <strong>{post.title}</strong>
        <small>{post.permalink}</small>
        {post.status === "scheduled" && post.published_at ? (
          <small className="schedule-hint">
            {t("content.scheduled_at", undefined, { time: new Date(post.published_at).toLocaleString() })}
          </small>
        ) : null}
      </td>
      <td>{post.slug}</td>
      <td>
        <span className={"badge " + post.status}>{t("status." + post.status, post.status)}</span>
      </td>
      <td>{new Date(post.updated_at).toLocaleString()}</td>
      <td className="row-actions">
        <Link className="icon-button" to={basePath + "/" + post.id + "/edit"} title={t("content.edit")}>
          <Edit3 size={16} />
        </Link>
      </td>
    </tr>
  );
}

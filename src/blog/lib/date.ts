import type { PostResponse } from "../types";

export function groupPostsByMonth(posts: PostResponse[]) {
  const formatter = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "long",
  });
  const groups = new Map<string, { key: string; label: string; posts: PostResponse[] }>();

  posts.forEach((post) => {
    const date = new Date(post.published_at || post.created_at);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const group = groups.get(key) || { key, label: formatter.format(date), posts: [] };
    group.posts.push(post);
    groups.set(key, group);
  });

  return Array.from(groups.values()).sort((left, right) => right.key.localeCompare(left.key));
}

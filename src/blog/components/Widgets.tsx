import { Link } from "react-router-dom";
import { stripHtml } from "../lib/text";
import type { PostResponse, RecentComment } from "../types";

export function PopularPosts({ posts, loading }: { posts: PostResponse[]; loading: boolean }) {
  return (
    <section className="widget">
      <h2>热门文章</h2>
      {loading ? <p>加载中...</p> : null}
      {!loading && posts.length === 0 ? <p>暂无热门文章</p> : null}
      {posts.map((post) => (
        <Link key={post.id} to={`/posts/${post.slug}`}>
          <span>{post.title}</span>
          <small>{post.view_count} 次浏览</small>
        </Link>
      ))}
    </section>
  );
}

export function RecentComments({ comments, loading }: { comments: RecentComment[]; loading: boolean }) {
  return (
    <section className="widget">
      <h2>最新评论</h2>
      {loading ? <p>加载中...</p> : null}
      {!loading && comments.length === 0 ? <p>暂无评论</p> : null}
      {comments.map((comment) => (
        <Link key={comment.id} to={`/posts/${comment.post_slug}`}>
          <span>{comment.author_name}</span>
          <small>{comment.post_title} · {stripHtml(comment.content).slice(0, 48)}</small>
        </Link>
      ))}
    </section>
  );
}

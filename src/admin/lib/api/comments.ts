import type { Comment, CommentStatus, Page } from "../../types";
import { post, put, query, request } from "./client";

export const commentsApi = {
  listComments: (params: { page?: number; per_page?: number; status?: CommentStatus; post_id?: number }) =>
    request<Page<Comment>>("/api/v1/comments" + query(params)),
  moderateComment: (id: number, status: CommentStatus) =>
    request<Comment>("/api/v1/comments/" + id + "/moderation", put({ status })),
  replyComment: (id: number, content: string) =>
    request<Comment>("/api/v1/comments/" + id + "/reply", post({ content })),
};


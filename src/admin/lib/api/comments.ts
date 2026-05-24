import type { Comment, CommentStatus, Page } from "../../types";
import { put, query, request } from "./client";

export const commentsApi = {
  listComments: (params: { page?: number; per_page?: number; status?: CommentStatus; post_id?: number }) =>
    request<Page<Comment>>("/api/v1/comments" + query(params)),
  moderateComment: (id: number, status: CommentStatus) =>
    request<Comment>("/api/v1/comments/" + id + "/moderation", put({ status })),
};

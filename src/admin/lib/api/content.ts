import type {
  BulkPostAction,
  BulkPostActionResponse,
  CreatePostInput,
  Page,
  Post,
  PostResponse,
  PostRevision,
  PostStatus,
  PostType,
  Term,
} from "../../types";
import { compactBody, post, put, query, request } from "./client";

function postResource(postType: PostType) {
  return postType === "page" ? "pages" : "posts";
}

function postPath(postType: PostType) {
  return "/api/v1/" + postResource(postType);
}

export const contentApi = {
  listPosts: (postType: PostType, params: { page?: number; per_page?: number; status?: PostStatus; q?: string }) =>
    request<Page<PostResponse>>(postPath(postType) + query(params)),
  listAdminPosts: (
    postType: PostType,
    params: { page?: number; per_page?: number; status?: PostStatus; q?: string; term_id?: number },
  ) => request<Page<PostResponse>>(postPath(postType) + "/admin" + query(params)),
  getPost: (postType: PostType, id: number) => request<PostResponse>(postPath(postType) + "/" + id),
  getAdminPost: (postType: PostType, id: number) => request<PostResponse>(postPath(postType) + "/admin/" + id),
  createPost: (postType: PostType, input: CreatePostInput) =>
    request<Post>(postPath(postType), post(compactBody({ ...input, post_type: postType }))),
  updatePost: (postType: PostType, id: number, input: Partial<CreatePostInput>) =>
    request<Post>(postPath(postType) + "/" + id, put(input)),
  deletePost: (postType: PostType, id: number) =>
    request<Post>(postPath(postType) + "/" + id, { method: "DELETE" }),
  listRevisions: (postType: PostType, id: number) =>
    request<PostRevision[]>(postPath(postType) + "/" + id + "/revisions"),
  restoreRevision: (postType: PostType, id: number, revisionId: number) =>
    request<Post>(postPath(postType) + "/" + id + "/revisions/" + revisionId + "/restore", put({})),
  bulkPostAction: (postType: PostType, input: { ids: number[]; action: BulkPostAction; published_at?: string | null }) =>
    request<BulkPostActionResponse>(postPath(postType) + "/bulk", put(input)),
  postTerms: (postType: PostType, id: number) => request<Term[]>(postPath(postType) + "/" + id + "/terms"),
  syncPostTerms: (postType: PostType, id: number, term_ids: number[]) =>
    request<Term[]>(postPath(postType) + "/" + id + "/terms", put({ term_ids })),
};

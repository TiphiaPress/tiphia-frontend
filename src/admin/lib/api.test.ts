import { describe, expect, it, vi } from "vitest";
import { api, ApiError, apiBase } from "./api";

describe("admin api client", () => {
  it("serializes content list filters", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ data: [], meta: { page: 1, per_page: 30, total: 0, total_pages: 0 } }), {
        status: 200,
      }),
    );

    await api.listAdminPosts("post", {
      page: 2,
      per_page: 30,
      status: "draft",
      q: "rust",
      term_id: 7,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${apiBase}/api/v1/posts/admin?page=2&per_page=30&status=draft&q=rust&term_id=7`,
      expect.any(Object),
    );

    fetchMock.mockRestore();
  });

  it("throws ApiError with backend error payload", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: { code: "validation_error", message: "bad input" } }), {
        status: 422,
      }),
    );

    await expect(api.health()).rejects.toMatchObject(
      new ApiError(422, "bad input", "validation_error"),
    );

    fetchMock.mockRestore();
  });
});

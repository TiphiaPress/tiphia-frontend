export const TERMS_PER_PAGE = 10;

export type TermUpdateInput = {
  name: string;
  slug: string;
  description: string;
  sort_order: number;
};

export function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120);
}

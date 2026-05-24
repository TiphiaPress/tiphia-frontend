export interface FriendLink {
  name: string;
  description?: string | null;
  url: string;
  avatar_url?: string | null;
  category?: string | null;
}

export interface FriendLinkGroup {
  category: string;
  links: FriendLink[];
}

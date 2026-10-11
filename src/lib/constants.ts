export const CATEGORIES = ["Music", "Workshop", "Food", "Sports", "Kids"] as const;
export type Category = (typeof CATEGORIES)[number];

export const PAGE_SIZE = 6;

// Event card designer
export const CARD_THEMES = ["sunset", "ocean", "midnight"] as const;
export type CardTheme = (typeof CARD_THEMES)[number];

export const STICKERS = ["star", "party", "music", "heart", "fire"] as const;
export type Sticker = (typeof STICKERS)[number];

export const MAX_STICKERS = 3;

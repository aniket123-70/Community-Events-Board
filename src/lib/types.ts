import type { Category } from "./constants";

export type EventItem = {
  id: number;
  title: string;
  category: Category;
  city: string;
  startsAt: string;
  price: number;
  description: string;
  imageUrl: string;
};

export type Pagination = { page: number; pageSize: number; total: number; totalPages: number };

export type User = { id: number; email: string; role: "USER" | "ADMIN"; favourites: Category[] };

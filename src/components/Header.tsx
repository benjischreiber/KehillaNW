import { client } from "@/sanity/lib/client";
import { mainNavCategoriesQuery } from "@/lib/queries";
import { Category } from "@/lib/types";
import HeaderClient from "@/components/HeaderClient";

export default async function Header() {
  const categories = await client.fetch<Category[]>(mainNavCategoriesQuery).catch(() => []);

  return <HeaderClient categories={categories} />;
}

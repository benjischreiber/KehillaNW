import { defineField, defineType } from "sanity";

export const categorySchema = defineType({
  name: "category",
  title: "Category",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "parent",
      title: "Parent Category",
      type: "reference",
      to: [{ type: "category" }],
    }),
    defineField({
      name: "colour",
      title: "Colour",
      type: "string",
      options: {
        list: [
          { title: "Blue (Government)", value: "blue" },
          { title: "Green (Support)", value: "green" },
          { title: "Purple (Shopping)", value: "purple" },
          { title: "Orange (Education)", value: "orange" },
          { title: "Teal (Community)", value: "teal" },
          { title: "Rose (Entertainment)", value: "rose" },
          { title: "Amber (Recipes)", value: "amber" },
          { title: "Navy (General)", value: "navy" },
        ],
      },
    }),
    defineField({
      name: "icon",
      title: "Icon (emoji)",
      type: "string",
      description: "Optional emoji e.g. 🏛️ 🛒 📚",
    }),
    defineField({
      name: "showInTopNav",
      title: "Show in top navigation",
      type: "boolean",
      description: "Shuls, Schools, Shiurim etc.",
      initialValue: false,
    }),
    defineField({
      name: "showInMainNav",
      title: "Show in main category bar",
      type: "boolean",
      description: "Government, Support, Shopping etc.",
      initialValue: false,
    }),
    defineField({
      name: "order",
      title: "Display order",
      type: "number",
      initialValue: 99,
    }),
  ],
  orderings: [
    {
      title: "Display order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
});

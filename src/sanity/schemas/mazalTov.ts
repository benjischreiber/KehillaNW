import { defineField, defineType } from "sanity";

export const mazalTovSchema = defineType({
  name: "mazalTov",
  title: "Mazal Tov",
  type: "document",
  fields: [
    defineField({
      name: "content",
      title: "Announcement",
      type: "text",
      rows: 3,
      description: "e.g. Mr & Mrs Smith on the birth of a baby boy",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "publishDate",
      title: "Date",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "visible",
      title: "Visible",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: "content",
      subtitle: "publishDate",
    },
  },
  orderings: [
    {
      title: "Newest first",
      name: "publishDateDesc",
      by: [{ field: "publishDate", direction: "desc" }],
    },
  ],
});

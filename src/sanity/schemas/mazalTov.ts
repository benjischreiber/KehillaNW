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
      rows: 4,
      description: "Separate multiple announcements with a blank line.",
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
    prepare({ title, subtitle }) {
      const firstLine = typeof title === "string" ? title.split(/\n+/)[0] : "Mazal Tov";
      return {
        title: firstLine,
        subtitle,
      };
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

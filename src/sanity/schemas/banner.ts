import { defineField, defineType } from "sanity";

export const bannerSchema = defineType({
  name: "banner",
  title: "Banner",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Banner Image",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "link",
      title: "Link URL",
      type: "url",
    }),
    defineField({
      name: "active",
      title: "Active",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "order",
      title: "Display order",
      type: "number",
      initialValue: 99,
    }),
  ],
});

import { defineField, defineType } from "sanity";

export const noticeSchema = defineType({
  name: "notice",
  title: "Notice",
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
      title: "URL Slug",
      type: "slug",
      options: { source: "title" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "secondaryCategory",
      title: "Secondary Category (optional)",
      type: "reference",
      to: [{ type: "category" }],
    }),
    defineField({
      name: "publishDate",
      title: "Publish Date",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "endDate",
      title: "End Date (optional)",
      type: "datetime",
      description: "If set, the notice will be hidden after this date",
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
      rows: 3,
      description: "Short description shown on listing pages",
    }),
    defineField({
      name: "content",
      title: "Content",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Heading 2", value: "h2" },
            { title: "Heading 3", value: "h3" },
            { title: "Heading 4", value: "h4" },
          ],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
              { title: "Underline", value: "underline" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [
                  { name: "href", type: "url", title: "URL" },
                  {
                    name: "blank",
                    type: "boolean",
                    title: "Open in new tab",
                    initialValue: true,
                  },
                ],
              },
            ],
          },
        },
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            {
              name: "alt",
              type: "string",
              title: "Alt text",
            },
          ],
        },
      ],
    }),
    defineField({
      name: "image",
      title: "Featured Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "pdfFile",
      title: "PDF Attachment",
      type: "file",
      options: { accept: ".pdf" },
      description: "Upload a PDF flyer or document for this notice",
    }),
    defineField({
      name: "externalLink",
      title: "External Link",
      type: "url",
      description: "Optional link to an external website for more info",
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      description: "Show in the featured carousel on the home page",
      initialValue: false,
    }),
    defineField({
      name: "isEvent",
      title: "This is an event",
      type: "boolean",
      description: "Show in the Upcoming Events ticker",
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "summary",
      media: "image",
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

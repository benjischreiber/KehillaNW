import { defineField, defineType } from "sanity";
import NoticeContentInput from "@/components/NoticeContentInput";

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
      name: "visible",
      title: "Visible on website",
      type: "boolean",
      description: "Turn this off to hide the notice without deleting it",
      initialValue: true,
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
      weak: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "secondaryCategory",
      title: "Secondary Category (optional)",
      type: "reference",
      to: [{ type: "category" }],
      weak: true,
    }),
    defineField({
      name: "publishDate",
      title: "Publish Date",
      type: "datetime",
      description: "When this notice should appear in normal notice listings",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "eventDate",
      title: "Event Date",
      type: "datetime",
      description: "When the event is happening. Used in the Upcoming Events ticker.",
      hidden: ({ document }) => !document?.isEvent,
      validation: (rule) =>
        rule.custom((value, context) => {
          if (context.document?.isEvent && !value) {
            return "Please add an event date for events";
          }
          return true;
        }),
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
      components: {
        input: NoticeContentInput as never,
      },
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
                  {
                    name: "href",
                    type: "string",
                    title: "URL or Email",
                    description: "Accepts websites, email addresses, phone numbers, or any pasted link text",
                  },
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
      type: "string",
      description: "Optional website, email, phone number, or any other contact link",
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
      description: "Show in the Upcoming Events ticker and reveal the Event Date field",
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

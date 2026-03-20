import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./src/sanity/schemas";

export default defineConfig({
  name: "kehillanw",
  title: "KehillaNW Admin",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "placeholder",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  basePath: "/studio",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("Notices")
              .child(
                S.documentTypeList("notice")
                  .title("All Notices")
                  .defaultOrdering([
                    { field: "publishDate", direction: "desc" },
                  ])
              ),
            S.listItem()
              .title("Mazal Tov")
              .child(
                S.documentTypeList("mazalTov")
                  .title("Mazal Tov Announcements")
                  .defaultOrdering([
                    { field: "publishDate", direction: "desc" },
                  ])
              ),
            S.listItem()
              .title("Banners")
              .child(
                S.documentTypeList("banner")
                  .title("Banners")
              ),
            S.listItem()
              .title("Categories")
              .child(
                S.documentTypeList("category")
                  .title("Categories")
              ),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
});

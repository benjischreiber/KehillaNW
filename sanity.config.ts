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
                S.documentList()
                  .title("All Notices")
                  .filter('_type == "notice"')
                  .defaultOrdering([
                    { field: "publishDate", direction: "desc" },
                  ])
              ),
            S.listItem()
              .title("Mazal Tov")
              .child(
                S.documentList()
                  .title("Mazal Tov Announcements")
                  .filter('_type == "mazalTov"')
                  .defaultOrdering([
                    { field: "publishDate", direction: "desc" },
                  ])
              ),
            S.listItem()
              .title("Banners")
              .child(
                S.documentList()
                  .title("Banners")
                  .filter('_type == "banner"')
              ),
            S.listItem()
              .title("Categories")
              .child(
                S.documentList()
                  .title("Categories")
                  .filter('_type == "category"')
              ),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
});

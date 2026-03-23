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
                S.list()
                  .title("Notices")
                  .items([
                    S.listItem()
                      .title("All Notices")
                      .child(
                        S.documentTypeList("notice")
                          .title("All Notices")
                          .defaultOrdering([
                            { field: "publishDate", direction: "desc" },
                          ])
                      ),
                    S.listItem()
                      .title("Visible Notices")
                      .child(
                        S.documentList()
                          .title("Visible Notices")
                          .schemaType("notice")
                          .filter('_type == "notice" && (!defined(visible) || visible == true)')
                          .defaultOrdering([
                            { field: "publishDate", direction: "desc" },
                          ])
                      ),
                    S.listItem()
                      .title("Hidden Notices")
                      .child(
                        S.documentList()
                          .title("Hidden Notices")
                          .schemaType("notice")
                          .filter('_type == "notice" && visible == false')
                          .defaultOrdering([
                            { field: "_updatedAt", direction: "desc" },
                          ])
                      ),
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
                S.list()
                  .title("Categories")
                  .items([
                    S.listItem()
                      .title("All Categories")
                      .child(
                        S.documentTypeList("category")
                          .title("All Categories")
                      ),
                    S.listItem()
                      .title("Visible Categories")
                      .child(
                        S.documentList()
                          .title("Visible Categories")
                          .schemaType("category")
                          .filter('_type == "category" && (!defined(visible) || visible == true)')
                          .defaultOrdering([
                            { field: "order", direction: "asc" },
                            { field: "title", direction: "asc" },
                          ])
                      ),
                    S.listItem()
                      .title("Hidden Categories")
                      .child(
                        S.documentList()
                          .title("Hidden Categories")
                          .schemaType("category")
                          .filter('_type == "category" && visible == false')
                          .defaultOrdering([
                            { field: "title", direction: "asc" },
                          ])
                      ),
                  ])
              ),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
});

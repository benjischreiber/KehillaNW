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
                  .schemaType("notice")
                  .filter('_type == "notice"')
                  .menuItems([
                    ...S.orderingMenuItemsForType("notice"),
                    ...S.documentTypeList("notice").getMenuItems(),
                  ])
                  .defaultOrdering([
                    { field: "publishDate", direction: "desc" },
                  ])
              ),
            S.listItem()
              .title("Mazal Tov")
              .child(
                S.documentList()
                  .title("Mazal Tov Announcements")
                  .schemaType("mazalTov")
                  .filter('_type == "mazalTov"')
                  .menuItems([
                    ...S.orderingMenuItemsForType("mazalTov"),
                    ...S.documentTypeList("mazalTov").getMenuItems(),
                  ])
                  .defaultOrdering([
                    { field: "publishDate", direction: "desc" },
                  ])
              ),
            S.listItem()
              .title("Banners")
              .child(
                S.documentList()
                  .title("Banners")
                  .schemaType("banner")
                  .filter('_type == "banner"')
                  .menuItems([
                    ...S.orderingMenuItemsForType("banner"),
                    ...S.documentTypeList("banner").getMenuItems(),
                  ])
              ),
            S.listItem()
              .title("Categories")
              .child(
                S.documentList()
                  .title("Categories")
                  .schemaType("category")
                  .filter('_type == "category"')
                  .menuItems([
                    ...S.orderingMenuItemsForType("category"),
                    ...S.documentTypeList("category").getMenuItems(),
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

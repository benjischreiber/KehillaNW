import type { NextConfig } from "next";

const legacyCategoryRedirects = [
  { from: "medical-advice", to: "government" },
  { from: "government", to: "government" },
  { from: "support", to: "support" },
  { from: "shopping", to: "shopping" },
  { from: "education", to: "education" },
  { from: "community", to: "community" },
  { from: "entertainment", to: "entertainment" },
  { from: "announcements", to: "announcements" },
  { from: "local-guidance", to: "local-guidance" },
  { from: "halacha", to: "halacha" },
  { from: "kashrus", to: "kashrus" },
  { from: "local-shops", to: "local-shops" },
  { from: "shop-announcements", to: "shop-announcements" },
  { from: "cateringtake-away", to: "cateringtake-away" },
  { from: "kosher-outdoor-dining", to: "kosher-outdoor-dining" },
  { from: "gifts", to: "gifts" },
  { from: "recipes", to: "recipes" },
  { from: "outings-and-activities", to: "outings-activities" },
  { from: "online-events", to: "online-events" },
  { from: "purim", to: "purim" },
  { from: "pesach", to: "pesach" },
  { from: "travel", to: "travel" },
  { from: "childrens-education", to: "childrens-education" },
  { from: "information-for-educators", to: "information-for-educators" },
  { from: "beis-hamikdosh", to: "beis-hamikdosh" },
  { from: "shiurim", to: "shiurim" },
  { from: "parsha", to: "parsha" },
  { from: "organisations", to: "organisations" },
  { from: "volunteering", to: "volunteering" },
  { from: "women", to: "women" },
  { from: "work-avenue", to: "work-avenue" },
  { from: "business-directory", to: "business-directory" },
  { from: "wellbeing", to: "wellbeing" },
  { from: "parenting", to: "parenting" },
  { from: "gemachim", to: "gemachim" },
  { from: "financial-advice", to: "support" },
  { from: "yom-hashoah", to: "education" },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "kehillanw.org",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/articles", destination: "/notices", permanent: true },
      { source: "/articles/", destination: "/notices", permanent: true },
      { source: "/articles/:category/:slug.html", destination: "/notices/:slug", permanent: true },
      { source: "/articles/:category/:slug", destination: "/notices/:slug", permanent: true },
      ...legacyCategoryRedirects.flatMap(({ from, to }) => [
        {
          source: `/articles/${from}`,
          destination: `/category/${to}`,
          permanent: true,
        },
        {
          source: `/articles/${from}/`,
          destination: `/category/${to}`,
          permanent: true,
        },
      ]),
    ];
  },
};

export default nextConfig;

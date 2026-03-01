import { groq } from "next-sanity";

export const noticeFields = groq`
  _id,
  title,
  slug,
  summary,
  publishDate,
  endDate,
  featured,
  isEvent,
  externalLink,
  image,
  "categoryTitle": category->title,
  "categorySlug": category->slug.current,
  "categoryColour": category->colour,
  "secondaryCategoryTitle": secondaryCategory->title,
  "secondaryCategorySlug": secondaryCategory->slug.current,
`;

export const featuredNoticesQuery = groq`
  *[_type == "notice" && featured == true && (!defined(endDate) || endDate > now())]
  | order(publishDate desc)[0..7]{${noticeFields}}
`;

export const recentNoticesQuery = groq`
  *[_type == "notice" && (!defined(endDate) || endDate > now())]
  | order(publishDate desc)[0..47]{${noticeFields}}
`;

export const upcomingEventsQuery = groq`
  *[_type == "notice" && isEvent == true && (!defined(endDate) || endDate > now())]
  | order(publishDate asc)[0..7]{
    _id,
    title,
    publishDate,
    slug,
    "categoryTitle": category->title,
  }
`;

export const noticesByCategory = groq`
  *[_type == "notice" && (
    category->slug.current == $slug ||
    category->parent->slug.current == $slug ||
    secondaryCategory->slug.current == $slug ||
    secondaryCategory->parent->slug.current == $slug
  ) && (!defined(endDate) || endDate > now())]
  | order(publishDate desc)[0..599]{${noticeFields}}
`;

export const noticeBySlug = groq`
  *[_type == "notice" && slug.current == $slug][0]{
    ${noticeFields}
    content,
    "pdfUrl": pdfFile.asset->url,
  }
`;

export const allNoticesQuery = groq`
  *[_type == "notice" && (!defined(endDate) || endDate > now())]
  | order(publishDate desc)[0..599]{${noticeFields}}
`;

export const activeBannersQuery = groq`
  *[_type == "banner" && active == true] | order(order asc){
    _id, title, image, link
  }
`;

export const mazalTovQuery = groq`
  *[_type == "mazalTov" && visible == true] | order(publishDate desc)[0..9]{
    _id, content, publishDate
  }
`;

export const categoryWithParent = groq`
  *[_type == "category" && slug.current == $slug][0]{
    _id, title, colour,
    "parentSlug": parent->slug.current,
    "parentTitle": parent->title,
    "parentColour": parent->colour,
  }
`;

export const subcategoriesForParent = groq`
  *[_type == "category" && parent->slug.current == $parentSlug] | order(order asc, title asc){
    _id, title, colour, "slug": slug.current
  }
`;

export const topNavCategoriesQuery = groq`
  *[_type == "category" && showInTopNav == true] | order(order asc){
    _id, title, slug
  }
`;

export const mainNavCategoriesQuery = groq`
  *[_type == "category" && showInMainNav == true] | order(order asc){
    _id, title, slug, colour, icon
  }
`;

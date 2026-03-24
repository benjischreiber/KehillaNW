import { groq } from "next-sanity";

export const noticeFields = groq`
  _id,
  _updatedAt,
  title,
  slug,
  summary,
  publishDate,
  eventDate,
  endDate,
  featured,
  isEvent,
  externalLink,
  "pdfUrl": pdfFile.asset->url,
  image,
  "categoryTitle": category->title,
  "categorySlug": category->slug.current,
  "categoryColour": category->colour,
  "secondaryCategoryTitle": secondaryCategory->title,
  "secondaryCategorySlug": secondaryCategory->slug.current,
`;

const activeNoticeVisibilityFilter = `
  (!defined(visible) || visible == true)
  && (!defined(endDate) || endDate > now())
  && (
    (
      defined(category)
      && defined(category->_id)
      && (!defined(category->visible) || category->visible == true)
      && (!defined(category->parent) || !defined(category->parent->visible) || category->parent->visible == true)
    )
    || (
      defined(secondaryCategory)
      && defined(secondaryCategory->_id)
      && (!defined(secondaryCategory->visible) || secondaryCategory->visible == true)
      && (!defined(secondaryCategory->parent) || !defined(secondaryCategory->parent->visible) || secondaryCategory->parent->visible == true)
    )
  )
`;

export const featuredNoticesQuery = groq`
  *[_type == "notice" && featured == true && ${activeNoticeVisibilityFilter}]
  | order(coalesce(publishDate, _createdAt) desc, _createdAt desc)[0..7]{${noticeFields}}
`;

export const recentNoticesQuery = groq`
  *[_type == "notice" && ${activeNoticeVisibilityFilter}]
  | order(coalesce(publishDate, _createdAt) desc, _createdAt desc)[0..47]{${noticeFields}}
`;

export const upcomingEventsQuery = groq`
  *[_type == "notice" && isEvent == true
    && ${activeNoticeVisibilityFilter}
    && coalesce(eventDate, publishDate) > now()]
  | order(coalesce(eventDate, publishDate) asc)[0..7]{
    _id,
    title,
    eventDate,
    publishDate,
    slug,
    "categoryTitle": category->title,
  }
`;

export const noticesByCategory = groq`
  *[_type == "notice" && (
    (category->slug.current == $slug && (!defined(category->visible) || category->visible == true)) ||
    (category->parent->slug.current == $slug && (!defined(category->parent->visible) || category->parent->visible == true)) ||
    (secondaryCategory->slug.current == $slug && (!defined(secondaryCategory->visible) || secondaryCategory->visible == true)) ||
    (secondaryCategory->parent->slug.current == $slug && (!defined(secondaryCategory->parent->visible) || secondaryCategory->parent->visible == true))
  ) && ${activeNoticeVisibilityFilter}]
  | order(coalesce(publishDate, _createdAt) desc, _createdAt desc)[0..599]{${noticeFields}}
`;

export const noticeBySlug = groq`
  *[_type == "notice" && slug.current == $slug && ${activeNoticeVisibilityFilter}][0]{
    ${noticeFields}
    content,
  }
`;

export const allNoticesQuery = groq`
  *[_type == "notice" && ${activeNoticeVisibilityFilter}]
  | order(coalesce(publishDate, _createdAt) desc, _createdAt desc)[0..599]{${noticeFields}}
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

export const allMazalTovQuery = groq`
  *[_type == "mazalTov" && visible == true] | order(publishDate desc)[0..199]{
    _id, content, publishDate
  }
`;

export const categoryWithParent = groq`
  *[_type == "category" && slug.current == $slug && (!defined(visible) || visible == true)][0]{
    _id, title, colour,
    "parentSlug": parent->slug.current,
    "parentTitle": parent->title,
    "parentColour": parent->colour,
  }
`;

export const subcategoriesForParent = groq`
  *[
    _type == "category"
    && parent->slug.current == $parentSlug
    && (!defined(visible) || visible == true)
    && count(*[
      _type == "notice"
      && ${activeNoticeVisibilityFilter}
      && (
        category._ref == ^._id
        || secondaryCategory._ref == ^._id
      )
    ]) > 0
  ] | order(order asc, title asc){
    _id, title, colour, "slug": slug.current
  }
`;

export const topNavCategoriesQuery = groq`
  *[_type == "category" && showInTopNav == true && (!defined(visible) || visible == true)] | order(order asc){
    _id, title, slug
  }
`;

export const mainNavCategoriesQuery = groq`
  *[_type == "category" && showInMainNav == true && (!defined(visible) || visible == true)] | order(order asc){
    _id, title, slug, colour, icon
  }
`;

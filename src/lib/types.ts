export interface Notice {
  _id: string;
  title: string;
  slug: { current: string };
  summary?: string;
  publishDate?: string;
  endDate?: string;
  featured?: boolean;
  isEvent?: boolean;
  externalLink?: string;
  pdfUrl?: string;
  image?: SanityImage;
  categoryTitle?: string;
  categorySlug?: string;
  categoryColour?: string;
  secondaryCategoryTitle?: string;
  secondaryCategorySlug?: string;
  content?: PortableTextBlock[];
}

export interface Category {
  _id: string;
  title: string;
  slug: { current: string };
  colour?: string;
  icon?: string;
  showInTopNav?: boolean;
  showInMainNav?: boolean;
  order?: number;
}

export interface Banner {
  _id: string;
  title: string;
  image: SanityImage;
  link?: string;
}

export interface MazalTov {
  _id: string;
  content: string;
  publishDate: string;
}

export interface SanityImage {
  _type: "image";
  asset: {
    _ref: string;
    _type: "reference";
  };
  hotspot?: {
    x: number;
    y: number;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PortableTextBlock = any;

export const categoryColourMap: Record<string, string> = {
  blue: "bg-blue-600",
  green: "bg-green-600",
  purple: "bg-purple-600",
  orange: "bg-orange-500",
  teal: "bg-teal-600",
  rose: "bg-rose-600",
  amber: "bg-amber-500",
  navy: "bg-navy-700",
};

export const categoryColourTintMap: Record<string, string> = {
  blue: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
  green: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
  purple: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
  orange: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
  teal: "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100",
  rose: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100",
  amber: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
  navy: "bg-navy-50 text-navy-700 border-navy-200 hover:bg-navy-100",
};

export const categoryColourTextMap: Record<string, string> = {
  blue: "text-blue-700 bg-blue-50",
  green: "text-green-700 bg-green-50",
  purple: "text-purple-700 bg-purple-50",
  orange: "text-orange-700 bg-orange-50",
  teal: "text-teal-700 bg-teal-50",
  rose: "text-rose-700 bg-rose-50",
  amber: "text-amber-700 bg-amber-50",
  navy: "text-blue-800 bg-blue-50",
};

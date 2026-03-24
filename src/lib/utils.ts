import { format, parseISO } from "date-fns";

export function formatDate(dateString: string): string {
  try {
    return format(parseISO(dateString), "d MMM yyyy");
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    return format(parseISO(dateString), "d MMM yyyy, h:mm a");
  } catch {
    return dateString;
  }
}

export function splitAnnouncements(content: string): string[] {
  return content
    .split(/\n\s*\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

const htmlEntityMap: Record<string, string> = {
  "&amp;": "&",
  "&bull;": "•",
  "&nbsp;": " ",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&lt;": "<",
  "&gt;": ">",
};

export function decodeHtmlEntities(text: string): string {
  return text.replace(/&(?:amp|bull|nbsp|quot|#39|apos|lt|gt);|&#x?[0-9a-fA-F]+;/g, (entity) => {
    if (htmlEntityMap[entity]) return htmlEntityMap[entity];

    const isHex = entity.startsWith("&#x");
    const code = entity.slice(isHex ? 3 : 2, -1);
    const codePoint = Number.parseInt(code, isHex ? 16 : 10);

    return Number.isNaN(codePoint) ? entity : String.fromCodePoint(codePoint);
  });
}

export function decodePortableTextValue<T>(value: T): T {
  if (typeof value === "string") {
    return decodeHtmlEntities(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => decodePortableTextValue(item)) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, decodePortableTextValue(nestedValue)])
    ) as T;
  }

  return value;
}

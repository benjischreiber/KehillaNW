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

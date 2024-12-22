import { format, toDate } from "date-fns";

export const dateFormat = (datetime: string | number | Date): Date => {
  return toDate(format(datetime, "yyyy-MM-dd'T'HH:mm:ss'Z'"));
};
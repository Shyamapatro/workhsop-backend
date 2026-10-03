import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import { parse, format as formatDateFns, isValid, parseISO } from 'date-fns';
/**
 * Gets the start and end of a specific date in a specific timezone
 */
export const getStartAndEndOfDay = (
  date: Date | string,
  timezone: string = 'Asia/Kolkata'
) => {
  const dateString =
    typeof date === 'string'
      ? date.substring(0, 10)
      : formatDateFns(date, 'yyyy-MM-dd');

  const start = parse(
    `${dateString} 00:00:00`,
    'yyyy-MM-dd HH:mm:ss',
    new Date()
  );

  const end = parse(
    `${dateString} 23:59:59.999`,
    'yyyy-MM-dd HH:mm:ss.SSS',
    new Date()
  );

  return {
    startOfDay: fromZonedTime(start, timezone),
    endOfDay: fromZonedTime(end, timezone),
  };
};

/**
 * Parses the range query parameter and returns exact UTC boundaries for the given timezone
 */
export const getDateRangeBounds = (
  range: 'today' | 'yesterday' | '7days' | '1month' | 'custom',
  customStartDate?: string,
  customEndDate?: string,
  timezone: string = 'Asia/Kolkata'
) => {
  const now = new Date();
  
  if (range === 'custom' && customStartDate && customEndDate) {
    const { startOfDay } = getStartAndEndOfDay(new Date(customStartDate), timezone);
    const { endOfDay } = getStartAndEndOfDay(new Date(customEndDate), timezone);
    return { start: startOfDay, end: endOfDay };
  }

  const { startOfDay: todayStart, endOfDay: todayEnd } = getStartAndEndOfDay(now, timezone);

  if (range === 'today') {
    return { start: todayStart, end: todayEnd };
  }

  if (range === 'yesterday') {
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const { startOfDay, endOfDay } = getStartAndEndOfDay(yesterday, timezone);
    return { start: startOfDay, end: endOfDay };
  }

  if (range === '7days') {
    const sevenDaysAgo = new Date(todayStart.getTime() - 6 * 24 * 60 * 60 * 1000);
    return { start: sevenDaysAgo, end: todayEnd };
  }

  if (range === '1month') {
    // Approx 30 days for 1 month
    const oneMonthAgo = new Date(todayStart.getTime() - 29 * 24 * 60 * 60 * 1000);
    return { start: oneMonthAgo, end: todayEnd };
  }

  return { start: todayStart, end: todayEnd };
};

/**
 * Robustly parses and formats workshop date and time from various formats
 */
export const formatWorkshopDateTime = (dateStr?: string, timeStr?: string) => {
  let formattedDay = "TBD";
  let formattedDate = dateStr || "TBD";
  let formattedTime = timeStr || "TBD";

  if (dateStr) {
    let parsedDate = parseISO(dateStr);
    if (!isValid(parsedDate)) {
      const formats = ["do MMMM yyyy, eeee", "dd MMMM yyyy, eeee", "yyyy-MM-dd", "dd-MM-yyyy", "MM/dd/yyyy"];
      for (const fmt of formats) {
        const attempt = parse(dateStr, fmt, new Date());
        if (isValid(attempt)) {
          parsedDate = attempt;
          break;
        }
      }
    }
    
    if (isValid(parsedDate)) {
      formattedDay = formatDateFns(parsedDate, "eeee");
      formattedDate = formatDateFns(parsedDate, "dd MMMM yyyy");
    }
  }

  if (timeStr) {
    const timeFormats = ["HH:mm", "hh:mm a", "h:mm a", "h a", "hh a"];
    for (const fmt of timeFormats) {
      const attempt = parse(timeStr, fmt, new Date());
      if (isValid(attempt)) {
        // Use 'hh:mm a' and uppercase to get '11:00 AM'
        formattedTime = formatDateFns(attempt, "hh:mm a").toUpperCase();
        break;
      }
    }
  }

  return { formattedDay, formattedDate, formattedTime };
};

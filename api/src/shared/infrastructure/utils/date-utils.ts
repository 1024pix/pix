import dayjs from 'dayjs';
import timezonePlugin from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';

dayjs.extend(utc);
dayjs.extend(timezonePlugin);

const formatIsMatching = (dateString: string, inputFormat: string): boolean =>
  dateString.replace(/[0-9]/g, ' ') === inputFormat.replace(/(D|M|Y)/g, ' ');

const extractDatePart = (dateString: string, inputFormat: string, formatToken: string): string => {
  const formatCharacters = inputFormat.split('');
  return dateString
    .split('')
    .filter((_, index) => formatCharacters[index] === formatToken)
    .join('');
};

const expandTwoDigitYear = (year: string): string => {
  if (year.length !== 2) {
    return year;
  }
  const currentTwoDigitYear = new Date().getFullYear().toString().slice(-2);
  return year < currentTwoDigitYear ? `20${year}` : `19${year}`;
};

/** The date of a value, or null when the value is not a valid date nor a string in the format. */
const toDateObject = ({ dateString, inputFormat }: { dateString: unknown; inputFormat?: string }): Date | null => {
  if (dateString instanceof Date) {
    return Number.isNaN(dateString.getTime()) ? null : dateString;
  }

  if (typeof dateString !== 'string' || typeof inputFormat !== 'string') {
    return null;
  }

  if (!formatIsMatching(dateString, inputFormat)) {
    return null;
  }

  const year = expandTwoDigitYear(extractDatePart(dateString, inputFormat, 'Y'));
  const month = parseInt(extractDatePart(dateString, inputFormat, 'M')) - 1;
  const dayOfMonth = parseInt(extractDatePart(dateString, inputFormat, 'D'));

  const dateObject = new Date(Number(year), month, dayOfMonth);
  if (month !== dateObject.getMonth() || dayOfMonth !== dateObject.getDate()) {
    return null;
  }
  return dateObject;
};

const toIsoDateString = (date: Date): string => {
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const dayOfMonth = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${dayOfMonth}`;
};

/** The YYYY-MM-DD form of a date, or of a string in the given format, such as DD/MM/YYYY; null when invalid. */
export const convertDateValue = ({
  dateString,
  inputFormat,
}: {
  dateString: unknown;
  inputFormat?: string;
}): string | null => {
  const dateObject = toDateObject({ dateString, inputFormat });
  if (dateObject === null) {
    return null;
  }
  return toIsoDateString(dateObject);
};

export const isValidDate = (dateValue: unknown, format: string): boolean =>
  convertDateValue({ dateString: dateValue, inputFormat: format }) !== null;

/** A new date, on the first day of the month at midnight UTC. */
export const anonymizeGeneralizeDate = (date: Date | null | undefined): Date | null => {
  if (!date) return null;

  const newDate = new Date(date);
  newDate.setUTCDate(1);
  newDate.setUTCHours(0, 0, 0, 0);
  return newDate;
};

const isLeapYear = (year: number): boolean => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

/**
 * Returns the date(s) one year earlier.
 * Special cases:
 * - If the input is Feb 29 (leap day), returns an empty array.
 * - If the input is March 1 and the previous year is a leap year,
 *   returns both Feb 29 and March 1 of that year (to cover the "orphan" leap day).
 */
export const getDatesOneYearEarlier = (date: Date): Date[] => {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth(); // 0-indexed
  const day = date.getUTCDate();
  const previousYear = year - 1;

  if (month === 1 && day === 29) {
    return [];
  }

  if (month === 2 && day === 1 && isLeapYear(previousYear)) {
    return [new Date(Date.UTC(previousYear, 1, 29)), new Date(Date.UTC(previousYear, 2, 1))];
  }

  return [new Date(Date.UTC(previousYear, month, day))];
};

/**
 * The day of the date in the time zone, as YYYY-MM-DD. The time zone is a name
 * of the IANA database, such as Europe/Paris, not an offset.
 */
export const toDay = (date: Date, timezone: string): string => dayjs(date).tz(timezone).format('YYYY-MM-DD');

/**
 * The bounds of a day in the time zone, given as YYYY-MM-DD: its first instant,
 * included, and the first instant of the next day, excluded. A day is 23 or
 * 25 hours long when the clocks change. The time zone is a name of the IANA
 * database, such as Europe/Paris, not an offset.
 */
export const dayBounds = (day: string, timezone: string): { start: Date; end: Date } => {
  const nextDay = dayjs.utc(day).add(1, 'day').format('YYYY-MM-DD');
  return { start: dayjs.tz(day, timezone).toDate(), end: dayjs.tz(nextDay, timezone).toDate() };
};

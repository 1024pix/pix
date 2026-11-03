import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';

dayjs.extend(utc);
dayjs.extend(timezone);

export function isValidDate(dateValue, format) {
  return convertDateValue({ dateString: dateValue, inputFormat: format }) !== null;
}

export function convertDateValue({ dateString, inputFormat }) {
  const dateObject = toDateObject({ dateString, inputFormat });
  if (dateObject === null) {
    return null;
  }
  return toIsoDateString(dateObject);
}

function toDateObject({ dateString, inputFormat }) {
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

  const dateObject = new Date(year, month, dayOfMonth);
  if (month !== dateObject.getMonth() || dayOfMonth !== dateObject.getDate()) {
    return null;
  }
  return dateObject;
}

function formatIsMatching(dateString, inputFormat) {
  return dateString.replace(/[0-9]/g, ' ') === inputFormat.replace(/(D|M|Y)/g, ' ');
}

function extractDatePart(dateString, inputFormat, formatToken) {
  const formatCharacters = inputFormat.split('');
  return dateString
    .split('')
    .filter((_, index) => formatCharacters[index] === formatToken)
    .join('');
}

function expandTwoDigitYear(year) {
  if (year.length !== 2) {
    return year;
  }
  const currentTwoDigitYear = new Date().getFullYear().toString().slice(-2);
  return year < currentTwoDigitYear ? `20${year}` : `19${year}`;
}

function toIsoDateString(date) {
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const dayOfMonth = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${dayOfMonth}`;
}

/**
 * @param {Date} date
 * @returns {Date} a new Date object
 */
export function anonymizeGeneralizeDate(date) {
  if (!date) return null;

  const newDate = new Date(date);
  newDate.setUTCDate(1);
  newDate.setUTCHours(0, 0, 0, 0);
  return newDate;
}

/**
 * Returns the date(s) one year earlier.
 * Special cases:
 * - If the input is Feb 29 (leap day), returns an empty array.
 * - If the input is March 1 and the previous year is a leap year,
 *   returns both Feb 29 and March 1 of that year (to cover the "orphan" leap day).
 *
 * @param {Date} date
 * @returns {Date[]}
 */
export function getDatesOneYearEarlier(date) {
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
}

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * The day of the date in the timezone, as YYYY-MM-DD.
 *
 * @param {Date} date
 * @param {string} timezone an IANA timezone name, such as Europe/Paris
 * @returns {string}
 */
export function toDay(date, timezone) {
  return dayjs(date).tz(timezone).format('YYYY-MM-DD');
}

/**
 * The bounds of a day in the timezone, given as YYYY-MM-DD: its first instant,
 * included, and the first instant of the next day, excluded. A day is 23 or
 * 25 hours long when the clocks change.
 *
 * @param {string} day
 * @param {string} timezone an IANA timezone name, such as Europe/Paris
 * @returns {{ start: Date, end: Date }}
 */
export function dayBounds(day, timezone) {
  const nextDay = dayjs.utc(day).add(1, 'day').format('YYYY-MM-DD');
  return { start: dayjs.tz(day, timezone).toDate(), end: dayjs.tz(nextDay, timezone).toDate() };
}

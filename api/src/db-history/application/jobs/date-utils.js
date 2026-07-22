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

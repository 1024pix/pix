const SHORT_DATE_OPTIONS = { day: '2-digit', month: '2-digit', year: 'numeric' };
const DIGITS_BY_PART = { day: 2, month: 2, year: 4 };

function getShortDateParts(locale) {
  return new Intl.DateTimeFormat(locale, SHORT_DATE_OPTIONS).formatToParts(new Date(2020, 11, 31));
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Formats a date with the short numeric format of the locale (e.g. "31/12/2020" in French).
 */
export function formatShortDate(date, locale) {
  return new Intl.DateTimeFormat(locale, SHORT_DATE_OPTIONS).format(date);
}

/**
 * Strictly parses a date typed with the short numeric format of the locale
 * and returns it as "YYYY-MM-DD", or null if it is not a valid date.
 */
export function parseShortDate(value, locale) {
  const order = [];
  const pattern = getShortDateParts(locale)
    .map(({ type, value: partValue }) => {
      if (type in DIGITS_BY_PART) {
        order.push(type);
        return `(\\d{${DIGITS_BY_PART[type]}})`;
      }
      return escapeRegExp(partValue);
    })
    .join('');

  const match = new RegExp(`^${pattern}$`).exec(value ?? '');
  if (!match) return null;

  const { day, month, year } = Object.fromEntries(order.map((type, index) => [type, Number(match[index + 1])]));
  const date = new Date(year, month - 1, day);
  date.setFullYear(year);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;

  return [String(year).padStart(4, '0'), String(month).padStart(2, '0'), String(day).padStart(2, '0')].join('-');
}

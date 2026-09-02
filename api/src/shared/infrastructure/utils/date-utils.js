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

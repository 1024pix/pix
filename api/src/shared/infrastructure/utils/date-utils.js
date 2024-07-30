import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';

dayjs.extend(customParseFormat, {
  parseTwoDigitYear: (yearString) => {
    const year = parseInt(yearString);
    const currentYear = new Date().getFullYear();
    return 2000 + year < currentYear ? 2000 + year : 1900 + year;
  },
});

function isValidDate(dateValue, format) {
  return dayjs(dateValue, format, true).isValid() || dateValue instanceof Date;
}

function convertDateValue({ dateString, inputFormat, alternativeInputFormat = null, outputFormat }) {
  const isDateInstance = dateString instanceof Date;

  if (isDateInstance) {
    return formatDate([dateString], outputFormat);
  }

  if (isValidDate(dateString, inputFormat)) {
    return formatDate([dateString, inputFormat, true], outputFormat);
  } else if (alternativeInputFormat && isValidDate(dateString, alternativeInputFormat)) {
    return formatDate([dateString, alternativeInputFormat, true], outputFormat);
  }

  return null;
}

function formatDate(params, outputFormat) {
  return dayjs(...params).format(outputFormat);
}

function getNowDate() {
  return new Date();
}

/**
 * @param {Date} date
 * @returns {Date} a new Date object
 */
function anonymizeGeneralizeDate(date) {
  const newDate = new Date(date);
  newDate.setUTCDate(1);
  newDate.setUTCHours(0, 0, 0, 0);
  return newDate;
}

export { anonymizeGeneralizeDate, convertDateValue, getNowDate, isValidDate };

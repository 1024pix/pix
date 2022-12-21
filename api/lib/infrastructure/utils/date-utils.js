const dayjs = require('dayjs');
dayjs.extend(require('dayjs/plugin/utc'));
dayjs.extend(require('dayjs/plugin/customParseFormat'));

dayjs.parseTwoDigitYear = function (yearString) {
  const year = parseInt(yearString);
  const currentYear = new Date().getFullYear();
  return 2000 + year < currentYear ? 2000 + year : 1900 + year;
};

function isValidDate(dateValue, format) {
  return dayjs.utc(dateValue, format, true).isValid();
}

function convertDateValue({ dateString, inputFormat, alternativeInputFormat = null, outputFormat }) {
  if (isValidDate(dateString, inputFormat)) {
    return dayjs(dateString, inputFormat, true).format(outputFormat);
  } else if (alternativeInputFormat && isValidDate(dateString, alternativeInputFormat)) {
    return dayjs(dateString, alternativeInputFormat, true).format(outputFormat);
  }
  return null;
}

function getNowDate() {
  return new Date();
}

module.exports = {
  isValidDate,
  convertDateValue,
  getNowDate,
};

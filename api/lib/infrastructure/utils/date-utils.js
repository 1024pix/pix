import moment from 'moment-timezone';

moment.parseTwoDigitYear = function (yearString) {
  const year = parseInt(yearString);
  const currentYear = new Date().getFullYear();
  return 2000 + year < currentYear ? 2000 + year : 1900 + year;
};

function isValidDate(dateValue, format) {
  return moment.utc(dateValue, format, true).isValid();
}

function convertDateValue({ dateString, inputFormat, alternativeInputFormat = null, outputFormat }) {
  if (isValidDate(dateString, inputFormat)) {
    return moment(dateString, inputFormat, true).format(outputFormat);
  } else if (alternativeInputFormat && isValidDate(dateString, alternativeInputFormat)) {
    return moment(dateString, alternativeInputFormat, true).format(outputFormat);
  }
  return null;
}

function getNowDate() {
  return new Date();
}

export default {
  isValidDate,
  convertDateValue,
  getNowDate,
};

const moment = require('moment-timezone');

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

module.exports = {
  isValidDate,
  convertDateValue,
};

const moment = require('moment-timezone');

function isValidDate(dateValue, format) {
  return moment.utc(dateValue, format, true).isValid();
}

function convertDateValue(dateString, inputFormat, outputFormat) {
  return isValidDate(dateString, inputFormat) ? moment(dateString, inputFormat, true).format(outputFormat) : null;
}

module.exports = {
  isValidDate,
  convertDateValue,
};

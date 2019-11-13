const moment = require('moment-timezone');

function isValidDate(dateValue, format) {
  return moment.utc(dateValue, format, true).isValid();
}

module.exports = {
  isValidDate,
};

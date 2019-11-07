const moment = require('moment-timezone');

function isValidDate(dateString) {
  return moment.utc(dateString, 'YYYY-MM-DD', true).isValid();
}

module.exports = {
  isValidDate,
};

const hash = require('object-hash');
const moment = require('moment');

module.exports = {
  getCurrentCode() {
    const date = moment().utc().format('YYYY-MM-DD HH');

    return hash(date).slice(0, 6);
  }
};

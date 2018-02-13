const moment = require('moment');
const Feedback = require('../data/feedback');

function formatDate(date) {
  if (!date) {
    return null;
  }
  return moment(date).format('YYYY-MM-DD HH:mm:ss');
}

module.exports = {

  find(fields) {

    let { startDate, endDate } = fields || {};
    startDate = formatDate(startDate);
    endDate = formatDate(endDate);

    if (!startDate && !endDate) {
      return Feedback.fetchAll();
    }

    if (!startDate) {
      return Feedback.where('createdAt', '<', endDate).fetchAll();
    }

    if (!endDate) {
      return Feedback.where('createdAt', '>=', startDate).fetchAll();
    }

    return Feedback
      .query(qb => {
        qb.whereBetween('createdAt', [startDate, endDate]);
      })
      .fetchAll();
  }
};

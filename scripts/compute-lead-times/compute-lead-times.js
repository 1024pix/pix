const moment = require('moment');

function computeLeadTimes(tagDate, commitDateStrings) {
  const tagMoment = moment(new Date(tagDate));

  return commitDateStrings
    .map((dateString) => new Date(dateString))
    .map((commitDate) => moment(commitDate))
    .map((commitMoment) => {
      return {
        leadTime: _computeLeadTime(tagMoment, commitMoment)
      };
    });
}

function _computeLeadTime(tagMoment, commitMoment) {
  return tagMoment.diff(commitMoment, 'days');
}

module.exports = {
  computeLeadTimes
};

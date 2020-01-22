const moment = require('moment');

function computeLeadTimes(tagDate, commitDates) {
  latestCommitDate = commitDates[0];
  const leadTime = moment(tagDate).diff(moment(latestCommitDate), 'days');

  return [{leadTime}];
}

module.exports = {
  computeLeadTimes
}

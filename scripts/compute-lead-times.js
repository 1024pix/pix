const moment = require('moment');

///
// TODO
//
// Inputs:
// $ git show --pretty=format:"%ad" --summary v2.105.0 | tail -1 # tag date
// $ git log  --pretty=format:"%ad" v2.104.0...v2.105.0          # commit dates
//
// Outputs:
// - convert to csv

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

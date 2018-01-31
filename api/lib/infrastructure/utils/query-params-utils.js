const _ = require('lodash');

function extractFilters(request) {
  return _.reduce(request.query, (result, queryFilterValue, queryFilterKey) => {
    const field = queryFilterKey.match(/filter\[([a-zA-Z]*)]/)[1];
    if (field) {
      result[field] = queryFilterValue;
    }
    return result;
  }, {});
}

module.exports = {
  extractFilters
};

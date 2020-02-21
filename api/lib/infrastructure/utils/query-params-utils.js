const _ = require('lodash');

module.exports = { extractParameters };

// query example : 'filter[organizationId]=4&page[size]=30$page[number]=3&sort=-createdAt,name&include=user'
function extractParameters(query) {
  return {
    filter: _extractFilter(query),
    page: _extractPage(query),
    sort: _extractArrayParameter(query, 'sort'),
    include: _extractArrayParameter(query, 'include'),
  };
}

function _extractFilter(query) {
  const regex = /filter\[([a-zA-Z]*)]/;
  return _extractObjectParameter(query, regex);
}

function _extractPage(query) {
  const regex = /page\[([a-zA-Z]*)]/;
  const params = _extractObjectParameter(query, regex);

  return _convertToInt(params);
}

function _extractObjectParameter(query, regex) {
  return _.reduce(query, (result, queryFilterValue, queryFilterKey) => {
    const parameter = queryFilterKey.match(regex);
    if (parameter && parameter[1]) {
      result[parameter[1]] = queryFilterValue;
    }
    return result;
  }, {});
}

function _extractArrayParameter(query, parameterName) {
  return query[parameterName] ? query[parameterName].split(',') : [];
}

function _convertToInt(params) {
  return _.mapValues(params, (value) => parseInt(value));
}

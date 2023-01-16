const { headers } = require('../utils/csv/sessions-import');

function getHeaders() {
  const fields = _getHeadersAsArray();

  return fields;
}

function _getHeadersAsArray() {
  return Object.keys(headers)
    .reduce((arr, key) => [...arr, `"${headers[key]}"`], [])
    .join(';');
}

module.exports = { getHeaders };

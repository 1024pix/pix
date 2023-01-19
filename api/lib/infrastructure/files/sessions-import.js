const { Parser } = require('json2csv');
const { headers } = require('../utils/csv/sessions-import');

function getHeaders() {
  const fields = _getHeadersAsArray();
  const json2csvParser = new Parser({
    withBOM: true,
    includeEmptyRows: false,
    fields,
    delimiter: ';',
  });
  return json2csvParser.parse();
}

function _getHeadersAsArray() {
  return Object.keys(headers).reduce((arr, key) => [...arr, headers[key]], []);
}

module.exports = { getHeaders };

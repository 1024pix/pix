const { Parser } = require('json2csv');
const { headers } = require('../utils/csv/sessions-import');

function getHeaders(habilitationLabels) {
  const complementaryCertificationsHeaders = _getComplementaryCertificationsHeaders(habilitationLabels);
  const fields = _getHeadersAsArray(complementaryCertificationsHeaders);
  const json2csvParser = new Parser({
    withBOM: true,
    includeEmptyRows: false,
    fields,
    delimiter: ';',
  });
  return json2csvParser.parse();
}

function _getComplementaryCertificationsHeaders(habilitationLabels) {
  return habilitationLabels?.map((habilitationLabel) => `${habilitationLabel} ('oui' ou laisser vide)`);
}

function _getHeadersAsArray(complementaryCertificationsHeaders = []) {
  const csvHeaders = Object.keys(headers).reduce((arr, key) => [...arr, headers[key]], []);
  return [...csvHeaders, ...complementaryCertificationsHeaders];
}

module.exports = { getHeaders };

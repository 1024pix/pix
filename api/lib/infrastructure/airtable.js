const Airtable = require('airtable');
const lcmsSettings = require('../config').lcms;
const logger = require('./logger');
const _ = require('lodash');

function _airtableClient() {
  return new Airtable({ endpointUrl: lcmsSettings.url, apiKey: lcmsSettings.apiKey }).base('content');
}

async function getRecord(tableName, recordId) {
  logger.info({ tableName, recordId }, 'Querying Airtable');
  const allRecords = await _airtableClient()
    .table(tableName)
    .select({ filterByFormula: `{id persistant}="${recordId}"` })
    .all();
  return _.first(allRecords);
}

function findRecords(tableName, fields) {
  logger.info({ tableName }, 'Querying Airtable');
  return _airtableClient()
    .table(tableName)
    .select(fields ? { fields } : {})
    .all();
}

module.exports = {
  getRecord,
  findRecords,
};

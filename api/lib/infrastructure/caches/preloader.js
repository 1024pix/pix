const airtable = require('../airtable');
const cache = require('./cache');
const AirtableDatasources = require('../datasources/airtable');
const _ = require('lodash');

function _cacheIndividually(records, tablename) {
  return Promise.all(records.map((record) => {
    const cacheKey = airtable.generateCacheKey(tablename, record.id);
    return cache.set(cacheKey, record._rawJson);
  }));
}

async function _loadAirtableClass(airtableClass) {
  const airtableName = airtableClass.tableName;
  const fields = airtableClass.usedFields;

  const records = await airtable.findRecordsSkipCache(airtableName, fields);
  return _cacheIndividually(records, airtableName);
}

function _loadRecord(tableName, recordId) {
  return airtable.getRecordSkipCache(tableName, recordId);
}

module.exports = {

  loadAllTables() {
    return Promise.all(_.map(AirtableDatasources, _loadAirtableClass));
  },

  load({ tableName, recordId }) {
    return _loadRecord(tableName, recordId);
  }

};

const airtable = require('../airtable');
const cache = require('./cache');

function _cacheIndividually(records, tablename) {
  return Promise.all(records.map((record) => {
    const cacheKey = airtable.generateCacheKey(tablename, record.id);
    return cache.set(cacheKey, record._rawJson);
  }));
}

function _loadTable(tableName) {
  return airtable.findRecordsSkipCache(tableName)
    .then((records) => _cacheIndividually(records, tableName));
}

function _loadRecord(tableName, recordId) {
  return airtable.getRecordSkipCache(tableName, recordId);
}

module.exports = {

  loadAllTables() {
    return Promise.all([
      'Acquis',
      'Competences',
      'Domaines',
      'Epreuves',
      'Tests',
      'Tutoriels',
    ].map(_loadTable));
  },

  load({ tableName, recordId }) {
    if (recordId) {
      return _loadRecord(tableName, recordId);
    }
    return _loadTable(tableName);
  }

};

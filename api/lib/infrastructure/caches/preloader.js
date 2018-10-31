const airtable = require('../airtable');
const cache = require('./cache');

function cacheIndividually(records, tablename) {
  return Promise.all(records.map((record) => {
    const cacheKey = `${tablename}_${record.id}`;
    return cache.set(cacheKey, record._rawJson);
  }));
}
function loadTable(tableName) {
  return airtable.findRecords(tableName)
    .then((records) => cacheIndividually(records, tableName));
}

function loadRecord(key) {
  const tableAndRecord = key.split('_');
  return airtable.getRecord(tableAndRecord[0], tableAndRecord[1]);
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
    ].map(loadTable));
  },

  loadKey(key) {
    if(key.includes('_')) {
      return loadRecord(key);
    }
    return loadTable(key);
  }

};

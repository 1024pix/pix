const airtable = require('../airtable');
const cache = require('./cache');

function cacheIndividually(records, tablename) {
  return Promise.all(records.map((record) => {
    const cacheKey = `${tablename}_${record.id}`;
    return cache.set(cacheKey, record._rawJson);
  }));
}
function loadTable(tableName) {
  const lookingForCache = false;
  return airtable.findRecords(tableName, lookingForCache)
    .then((records) => cacheIndividually(records, tableName));
}

function loadRecord(key) {
  const tableAndRecord = key.split('_');
  const lookingForCache = false;
  return airtable.getRecord(tableAndRecord[0], tableAndRecord[1], lookingForCache);
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

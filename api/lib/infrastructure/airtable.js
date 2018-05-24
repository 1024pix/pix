const Airtable = require('airtable');
const airtableConfig = require('../settings').airtable;
const cache = require('./caches/cache');
const hash = require('object-hash');

module.exports = {

  _base() {
    return new Airtable({ apiKey: airtableConfig.apiKey }).base(airtableConfig.base);
  },

  getRecord(tableName, recordId) {
    const cacheKey = `${tableName}_${recordId}`;
    const cachedValue = cache.get(cacheKey);
    if (cachedValue) {
      return Promise.resolve(cache.get(cacheKey));
    }
    return this._base()
      .table(tableName)
      .find(recordId)
      .then(record => {
        cache.set(cacheKey, record);
        return record;
      });
  },

  findRecords(tableName, query) {
    const cacheKey = `${tableName}_${hash(query)}`;
    const cachedValue = cache.get(cacheKey);
    if (cachedValue) {
      return Promise.resolve(cache.get(cacheKey));
    }
    return this._base()
      .table(tableName)
      .select(query)
      .all()
      .then(records => {
        cache.set(cacheKey, records);
        return records;
      });
  }

};

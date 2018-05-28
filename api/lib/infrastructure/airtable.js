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
    return cache.get(cacheKey)
      .then(cachedValue => {
        if(cachedValue) return cachedValue;

        return this._base()
          .table(tableName)
          .find(recordId)
          .then(record => {
            return cache.set(cacheKey, record)
              .then(() => record);
          });
      });
  },

  findRecords(tableName, query) {
    const cacheKey = `${tableName}_${hash(query)}`;
    return cache.get(cacheKey)
      .then(cachedValue => {
        if(cachedValue) return cachedValue;

        return this._base()
          .table(tableName)
          .select(query)
          .all()
          .then(records => {
            return cache.set(cacheKey, records)
              .then(() => records);
          });
      });
  }

};

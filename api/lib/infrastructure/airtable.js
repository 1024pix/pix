const Airtable = require('airtable');
const airtableConfig = require('../settings').airtable;
const cache = require('./caches/cache');
const hash = require('object-hash');

module.exports = {

  _base() {
    return new Airtable({ apiKey: airtableConfig.apiKey }).base(airtableConfig.base);
  },

  getRecord(tableName, recordId) {
    return new Promise((resolve, reject) => {
      const cacheKey = `${tableName}_${recordId}`;
      cache.get(cacheKey, (error, cachedValue) => {
        if (error) return reject(error);
        if (cachedValue) return resolve(cachedValue);

        this._base()
          .table(tableName)
          .find(recordId)
          .then(record => {
            cache.set(cacheKey, record);
            resolve(record);
          });
      });
    });
  },

  findRecords(tableName, query) {
    return new Promise((resolve, reject) => {
      const cacheKey = `${tableName}_${hash(query)}`;
      cache.get(cacheKey, (error, cachedValue) => {
        if (error) return reject(error);
        if (cachedValue) return resolve(cachedValue);

        this._base()
          .table(tableName)
          .select(query)
          .all()
          .then(records => {
            cache.set(cacheKey, records);
            resolve(records);
          });
      });
    });
  }

};

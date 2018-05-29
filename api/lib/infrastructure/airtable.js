const Airtable = require('airtable');
const AirtableRecord = Airtable.Record;
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

        if (cachedValue) {
          const rawJson = cachedValue;
          return new AirtableRecord(tableName, rawJson.id, rawJson);
        }

        return this._base()
          .table(tableName)
          .find(recordId)
          .then(record => {
            return cache.set(cacheKey, record._rawJson)
              .then(() => record);
          });
      });
  },

  findRecords(tableName, query) {
    const cacheKey = `${tableName}_${hash(query)}`;
    return cache.get(cacheKey)
      .then(cachedValue => {

        if (cachedValue) {
          const arrayOfRawJson = cachedValue;
          return arrayOfRawJson.map(rawJson => new AirtableRecord(tableName, rawJson.id, rawJson));
        }

        return this._base()
          .table(tableName)
          .select(query)
          .all()
          .then(records => {
            return cache.set(cacheKey, records.map(record => record._rawJson))
              .then(() => records);
          });
      });
  }
};

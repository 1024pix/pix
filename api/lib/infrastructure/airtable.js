const Airtable = require('airtable');
const airtableConfig = require('../settings').airtable;
const AirtableRecord = Airtable.Record;
const cache = require('./caches/cache');
const hash = require('object-hash');
const logger = require('./logger');

module.exports = {

  _base() {
    return new Airtable({ apiKey: airtableConfig.apiKey }).base(airtableConfig.base);
  },

  getRecord(tableName, recordId) {
    const cacheKey = `${tableName}_${recordId}`;
    const logContext = {
      zone: 'airtable.getRecord',
      type: 'airtable',
      recordId,
      tableName,
    };

    return cache.get(cacheKey)
      .then((cachedRawJson) => {
        if (cachedRawJson) {
          return new AirtableRecord(tableName, cachedRawJson.id, cachedRawJson);
        }

        logger.trace(logContext, 'cache miss. Calling airtable');
        return this._base()
          .table(tableName)
          .find(recordId)
          .then((record) => {
            logger.trace(logContext, 'found record in Airtable.');
            return cache.set(cacheKey, record._rawJson)
              .then(() => record);
          })
          .catch((err) => {
            logContext.err = err;
            logger.error(logContext, 'Airtable error');
            return Promise.reject(err);
          });
      });
  },

  findRecords(tableName, query) {
    const cacheKey = `${tableName}_${hash(query)}`;
    const logContext = {
      zone: 'airtable.getRecord',
      type: 'airtable',
      query,
      tableName,
    };

    return cache.get(cacheKey)
      .then((cachedArrayOfRawJson) => {
        if (cachedArrayOfRawJson) {
          return cachedArrayOfRawJson.map((rawJson) => new AirtableRecord(tableName, rawJson.id, rawJson));
        }

        logger.trace(logContext, 'cache miss. Calling airtable');
        return this._base()
          .table(tableName)
          .select(query)
          .all()
          .then((records) => {
            logger.trace(logContext, 'found record in Airtable.');
            return cache.set(cacheKey, records.map((record) => record._rawJson))
              .then(() => records);
          })
          .catch((err) => {
            logContext.err = err;
            logger.error(logContext, 'Airtable error');
            return Promise.reject(err);
          });
      });
  }
};

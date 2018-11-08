const Airtable = require('airtable');
const airtableConfig = require('../settings').airtable;
const AirtableRecord = Airtable.Record;
const cache = require('./caches/cache');
const logger = require('./logger');

function _base() {
  return new Airtable({ apiKey: airtableConfig.apiKey }).base(airtableConfig.base);
}

function _cacheKey(tableName, recordId) {
  return `${tableName}${recordId ? '_' + recordId : ''}`;
}

function getRecordSkipCache(tableName, recordId) {
  const logContext = {
    zone: 'airtable.getRecordSkipCache',
    type: 'airtable',
    recordId,
    tableName,
  };

  return _base()
    .table(tableName)
    .find(recordId)
    .then((record) => {
      logger.trace(logContext, 'found record in Airtable.');
      return cache.set(_cacheKey(tableName, recordId), record._rawJson)
        .then(() => record);
    })
    .catch((err) => {
      logContext.err = err;
      logger.error(logContext, 'Airtable error');
      return Promise.reject(err);
    });
}

function findRecordsSkipCache(tableName) {
  const logContext = {
    zone: 'airtable.findRecordsSkipCache',
    type: 'airtable',
    tableName,
  };

  return _base()
    .table(tableName)
    .select()
    .all()
    .then((records) => {
      logger.trace(logContext, 'found records in Airtable.');
      return cache.set(_cacheKey(tableName), records.map((record) => record._rawJson))
        .then(() => records);
    })
    .catch((err) => {
      logContext.err = err;
      logger.error(logContext, 'Airtable error');
      return Promise.reject(err);
    });
}

module.exports = {

  getRecordSkipCache,

  getRecord(tableName, recordId) {
    const logContext = {
      zone: 'airtable.getRecord',
      type: 'airtable',
      recordId,
      tableName,
    };

    return cache.get(_cacheKey(tableName, recordId))
      .then((cachedRawJson) => {
        if (cachedRawJson) {
          return new AirtableRecord(tableName, cachedRawJson.id, cachedRawJson);
        }

        logger.trace(logContext, 'cache miss. Calling airtable');

        return getRecordSkipCache(tableName, recordId);
      });
  },

  findRecordsSkipCache,

  findRecords(tableName) {
    const logContext = {
      zone: 'airtable.findRecords',
      type: 'airtable',
      tableName,
    };

    return cache.get(_cacheKey(tableName))
      .then((cachedArrayOfRawJson) => {
        if (cachedArrayOfRawJson) {
          return cachedArrayOfRawJson.map((rawJson) => new AirtableRecord(tableName, rawJson.id, rawJson));
        }

        logger.trace(logContext, 'cache miss. Calling airtable');

        return findRecordsSkipCache(tableName);
      });
  },
};

const Airtable = require('airtable');
const AirtableRecord = Airtable.Record;
const airtableSettings = require('../config').airtable;
const cache = require('./caches/cache');
const logger = require('./logger');

function _airtableClient() {
  return new Airtable({ apiKey: airtableSettings.apiKey }).base(airtableSettings.base);
}

function generateCacheKey(tableName, recordId) {
  return recordId ? `${tableName}_${recordId}` : `${tableName}`;
}

async function _queryAirtableRecord(tableName, recordId) {
  logger.info({ tableName, recordId }, 'Querying Airtable');
  const record = await _airtableClient()
    .table(tableName)
    .find(recordId);

  return record._rawJson;
}

async function _queryAirtableRecords(tableName) {
  logger.info({ tableName }, 'Querying Airtable');
  const records = await _airtableClient()
    .table(tableName)
    .select()
    .all();

  return records.map((record) => record._rawJson);
}

async function getRecord(tableName, recordId) {
  const cacheKey = generateCacheKey(tableName, recordId);
  const cachedRawJson = await cache.get(cacheKey, () => _queryAirtableRecord(tableName, recordId));

  return new AirtableRecord(tableName, cachedRawJson.id, cachedRawJson);
}

async function getRecordSkipCache(tableName, recordId) {
  const cacheKey = generateCacheKey(tableName, recordId);
  const recordAsJson = await _queryAirtableRecord(tableName, recordId);

  await cache.set(cacheKey, recordAsJson);

  return new AirtableRecord(tableName, recordAsJson.id, recordAsJson);
}

async function findRecords(tableName) {
  const cacheKey = generateCacheKey(tableName);
  const cachedArrayOfRawJson = await cache.get(cacheKey, () => _queryAirtableRecords(tableName));

  return cachedArrayOfRawJson.map((rawJson) => new AirtableRecord(tableName, rawJson.id, rawJson));
}

async function findRecordsSkipCache(tableName) {
  const cacheKey = generateCacheKey(tableName);
  const recordsAsJson = await _queryAirtableRecords(tableName);

  await cache.set(cacheKey, recordsAsJson);

  return recordsAsJson.map((rawJson) => new AirtableRecord(tableName, rawJson.id, rawJson));
}

module.exports = {
  generateCacheKey,
  getRecord,
  getRecordSkipCache,
  findRecords,
  findRecordsSkipCache,
};

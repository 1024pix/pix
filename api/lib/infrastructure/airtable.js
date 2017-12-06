const Airtable = require('airtable');
const airtableConfig = require('../settings').airtable;
const cache = require('./cache');
const hash = require('object-hash');

module.exports = {

  _base() {
    return new Airtable({ apiKey: airtableConfig.apiKey }).base(airtableConfig.base);
  },

  /**
   * Fetches from Airtable and deserializes a given record.
   *
   * @param {string} tableName - The name of the table in Airtable.
   * @param {string} id - The Airtable record ID of the entity.
   * @param {AirtableSerializer} serializer - The Airtable serializer used to deserialize the fetched data into an AirtableModel object.
   * @returns {AirtableModel} The fetched and deserialized model object
   */
  getRecord(tableName, id, serializer) {
    return this._base()
      .table(tableName)
      .find(id)
      .then(serializer.deserialize);
  },

  /**
   * Fetches from Airtable and deserializes a collection of records.
   *
   * @param {string} tableName - The name of the table in Airtable.
   * @param {Object} id - The Airtable record ID of the entity.
   * @param {AirtableSerializer} serializer - The Airtable serializer used to deserialize the fetched data into an AirtableModel object.
   * @returns {[AirtableModel]} An array of fetched and deserialized model objects
   */
  getRecords(tableName, query, serializer) {
    return new Promise((resolve, reject) => {
      const models = [];
      this._base()
        .table(tableName)
        .select(query)
        .eachPage(
          (records, fetchNextPage) => {
            records.forEach(record => {
              models.push(serializer.deserialize(record));
            });
            fetchNextPage();
          },
          (err) => {
            if (err) return reject(err);
            return resolve(models);
          });
    });
  },

  newGetRecord(tableName, recordId) {
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

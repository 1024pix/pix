const _ = require('lodash');
const airtable = require('../../airtable');
const AirtableResourceNotFound = require('./AirtableResourceNotFound');
const cache = require('../../caches/cache');

const _DatasourcePrototype = {

  _generateCacheKey(modelName, id) {
    return id ? `${modelName}_${id}` : `${modelName}`;
  },

  _doGet() {
    throw new AirtableResourceNotFound();
  },

  _doList() {
    return airtable.findRecords(this.tableName, this.usedFields)
      .then((airtableRawObjects) => {
        return airtableRawObjects.map(this.fromAirTableObject);
      });
  },

  get(id) {
    const key = this._generateCacheKey(this.modelName, id);
    const generator = () => this._doGet(id);
    return cache.get(key, generator);
  },

  list() {
    const key = this._generateCacheKey(this.modelName);
    const generator = () => this._doList();
    return cache.get(key, generator);
  },

  async loadEntries() {
    const cacheKeyList = this._generateCacheKey(this.modelName);
    const results = (await this._doList()).filter((record) => record.id);
    await cache.set(cacheKeyList, results);

    return Promise.all(results.map((record) => {
      const cacheKey = this._generateCacheKey(this.modelName, record.id);
      return cache.set(cacheKey, record);
    })).then(() => true);
  },

  async loadEntry() {
    throw new AirtableResourceNotFound();
  },

};

module.exports = {

  extend(props) {
    const result = Object.assign({}, _DatasourcePrototype, props);
    _.bindAll(result, _.functions(result));
    return result;
  },

};

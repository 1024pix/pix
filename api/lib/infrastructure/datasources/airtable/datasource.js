const _ = require('lodash');
const airtable = require('../../airtable');
const AirtableResourceNotFound = require('./AirtableResourceNotFound');
const cache = require('../../caches/learning-content-cache');

const _DatasourcePrototype = {

  async _doList() {
    const airtableRawObjects = await airtable.findRecords(this.tableName, this.usedFields);
    return airtableRawObjects.map(this.fromAirTableObject);
  },

  async get(id) {
    const modelObjects = await this.list();
    const foundObject = _.find(modelObjects, { id });

    if (!foundObject) {
      throw new AirtableResourceNotFound();
    }

    return foundObject;
  },

  async list() {
    const key = this.modelName;
    const generator = () => this._doList();
    return cache.get(key, generator);
  },

  async loadAirtableRecordsIntoCache() {
    const cacheKeyList = this.modelName;
    const results = await this._doList();
    await cache.set(cacheKeyList, results);
    return results;
  },

  async loadAirtableRecordIntoCache(id) {
    const cacheKeyList = this.modelName;
    const airtableRecord = await airtable.getRecord(this.tableName, id);
    const newEntry = this.fromAirTableObject(airtableRecord);
    const currentList = await this.list();
    const newList = _.reject(currentList, { id }).concat([newEntry]);
    await cache.set(cacheKeyList, newList);
    return newEntry;
  },

};

module.exports = {

  extend(props) {
    const result = Object.assign({}, _DatasourcePrototype, props);
    _.bindAll(result, _.functions(result));
    return result;
  },

};

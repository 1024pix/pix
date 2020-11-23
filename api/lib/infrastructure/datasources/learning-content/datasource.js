const _ = require('lodash');
const airtable = require('../../airtable');
const lcms = require('../../lcms');
const LearningContentResourceNotFound = require('./LearningContentResourceNotFound');
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
      throw new LearningContentResourceNotFound();
    }

    return foundObject;
  },

  async list() {
    const key = this.modelName;
    const generator = () => this._doList();
    return cache.get(key, generator);
  },

  async refreshLearningContentCacheRecord(id) {
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

  async refreshLearningContentCacheRecords() {
    const learningContent = await lcms.getLatestRelease();
    await cache.set('LearningContent', learningContent);
    return learningContent;
  },

};

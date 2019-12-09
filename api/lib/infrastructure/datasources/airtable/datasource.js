const _ = require('lodash');
const airtable = require('../../airtable');
const AirtableResourceNotFound = require('./AirtableResourceNotFound');
const cache = require('../../caches/cache');

function generateCacheKey(modelName, id) {
  return id ? `${modelName}_${id}` : `${modelName}`;
}

const _DatasourcePrototype = {

  get(id) {
    const cacheKey = generateCacheKey(this.modelName, id);

    const generator = () => {
      return airtable.getRecord(this.tableName, id).then(this.fromAirTableObject).catch((err) => {
        if (err.error === 'NOT_FOUND') {
          throw new AirtableResourceNotFound();
        }
        throw err;
      });
    };

    return cache.get(cacheKey, generator);
  },

  list() {
    const cacheKey = generateCacheKey(this.modelName);

    const generator = () => {
      return airtable.findRecords(this.tableName, this.usedFields)
        .then((airtableRawObjects) => {
          return airtableRawObjects.map(this.fromAirTableObject);
        });
    };

    return cache.get(cacheKey, generator);
  },

  async preload() {
    return airtable.preload(this.tableName, this.usedFields);
  },

};

module.exports = {

  extend(props) {
    const result = Object.assign({}, _DatasourcePrototype, props);
    _.bindAll(result, _.functions(result));
    return result;
  },

};

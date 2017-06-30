const cache = require('../cache');
const airtable = require('../airtable');
const serializer = require('../serializers/airtable/area-serializer');

const AIRTABLE_TABLE_NAME = 'Domaines';

module.exports = {

  list() {
    return new Promise((resolve, reject) => {
      const cacheKey = 'area-repository_list';

      cache.get(cacheKey, (err, cachedList) => {
        if(err) {
          return reject(err);
        }

        if(cachedList) {
          return resolve(cachedList);
        }

        airtable.getRecords(AIRTABLE_TABLE_NAME, {}, serializer)
          .then(areas => {
            cache.set(cacheKey, areas);
            resolve(areas);
          })
          .catch(reject);
      });

    });
  }

};

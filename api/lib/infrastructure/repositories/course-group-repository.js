const airtable = require('../airtable');
const serializer = require('../serializers/airtable/course-group-serializer');
const cache = require('../cache');

module.exports = {

  list() {

    return new Promise((resolve, reject) => {
      const cacheKey = 'course-group-repository_list';
      cache.get(cacheKey, (err, cachedValue) => {
        if (err) return reject(err);
        if (cachedValue) return resolve(cachedValue);

        airtable.getRecords('Groupes de tests', { view : 'Grid view' }, serializer).then((courseGroups) => {
          cache.set(cacheKey, courseGroups);
          return resolve(courseGroups);
        })
          .catch(reject);
      });
    });
  }

};


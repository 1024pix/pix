const cache = require('../cache');
const airtable = require('../airtable');
const serializer = require('../serializers/airtable/challenge-serializer');

const AIRTABLE_TABLE_NAME = 'Epreuves';

function _fetchChallenge(id, cacheKey, resolve, reject) {
  airtable
    .getRecord(AIRTABLE_TABLE_NAME, id, serializer)
    .then(challenge => {
      cache.set(cacheKey, challenge);
      return resolve(challenge);
    })
    .catch(reject);
}

module.exports = {

  list() {
    return new Promise((resolve, reject) => {
      const cacheKey = 'challenge-repository_list';
      cache.get(cacheKey, (err, cachedValue) => {
        if (err) return reject(err);
        if (cachedValue) return resolve(cachedValue);
        airtable
          .getRecords(AIRTABLE_TABLE_NAME, {}, serializer)
          .then(challenges => {
            cache.set(cacheKey, challenges);
            return resolve(challenges);
          })
          .catch(reject);
      });
    });
  },

  get(id) {
    return new Promise((resolve, reject) => {
      const cacheKey = `challenge-repository_get_${id}`;
      cache.get(cacheKey, (err, cachedValue) => {
        if (err) return reject(err);
        if (cachedValue) return resolve(cachedValue);
        return _fetchChallenge(id, cacheKey, resolve, reject);
      });
    });
  },

  refresh(id) {
    return new Promise((resolve, reject) => {
      const cacheKey = `challenge-repository_get_${id}`;
      cache.del(cacheKey, (err) => {
        if (err) return reject(err);
        const cacheSolutionKey = `solution_${id}`;
        cache.del(cacheSolutionKey, (err) => {
          if (err) return reject(err);
          return _fetchChallenge(id, cacheKey, resolve, reject);
        });
      });
    });
  }

};

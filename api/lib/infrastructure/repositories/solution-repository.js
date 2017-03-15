const cache = require('../cache');
const airtable = require('../airtable');
const serializer = require('../serializers/airtable/solution-serializer');

const AIRTABLE_TABLE_NAME = 'Epreuves';

function _fetchSolution(id, cacheKey, resolve, reject) {
  return airtable
    .getRecord(AIRTABLE_TABLE_NAME, id, serializer)
    .then(challenge => {
      cache.set(cacheKey, challenge);
      return resolve(challenge);
    })
    .catch(reject);
}

module.exports = {

  get(challengeId) {
    return new Promise((resolve, reject) => {
      const cacheKey = `solution-repository_get_${challengeId}`;
      cache.get(cacheKey, (err, cachedValue) => {
        if (err) return reject(err);
        if (cachedValue) return resolve(cachedValue);
        return _fetchSolution(challengeId, cacheKey, resolve, reject);
      });
    });
  },

  refresh(challengeId) {
    return new Promise((resolve, reject) => {
      const cacheKey = `solution-repository_get_${challengeId}`;
      cache.del(cacheKey, (err) => {
        if (err) return reject(err);
        return _fetchSolution(challengeId, cacheKey, resolve, reject);
      });
    });
  }

};


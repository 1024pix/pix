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

function _fetchChallenges(cacheKey, resolve, reject, filterFunction) {
  airtable
    .getRecords(AIRTABLE_TABLE_NAME, {}, serializer)
    .then(challenges => {
      const filteredChallenges = challenges.filter(filterFunction);
      cache.set(cacheKey, filteredChallenges);
      return resolve(filteredChallenges);
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
        return _fetchChallenges(cacheKey, resolve, reject, () => true);
      });
    });
  },

  findByCompetence(competence) {
    const cacheKey = `challenge-repository_find_by_competence_${competence.id}`;
    const cachedChallenges = cache.get(cacheKey);

    if (cachedChallenges) {
      return Promise.resolve(cachedChallenges);
    }

    return airtable
      .getRecords(AIRTABLE_TABLE_NAME, { view: competence.reference }, serializer)
      .then(fetchedChallenges => {
        cache.set(cacheKey, fetchedChallenges);
        return Promise.resolve(fetchedChallenges);
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

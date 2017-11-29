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

  getFromCompetenceId(competenceId) {
    return new Promise((resolve, reject) => {
      const cacheKey = `challenge-repository_get_from_competence_${competenceId}`;
      cache.get(cacheKey, (err, cachedValue) => {
        if (err) return reject(err);
        if (cachedValue) return resolve(cachedValue);
        return _fetchChallenges(cacheKey, resolve, reject,
          challenge => ['validé', 'validé sans test', 'pré-validé'].includes(challenge.status)
            && challenge.competence == competenceId);
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

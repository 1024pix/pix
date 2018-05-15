const cache = require('../cache');
const airtable = require('../airtable');
const serializer = require('../serializers/airtable/challenge-serializer');

const AIRTABLE_TABLE_NAME = 'Epreuves';

function _fetchChallenge(id, cacheKey, resolve, reject) {
  // TODO: use the ChallengeDataSource and not directly airtable
  airtable.getRecord(AIRTABLE_TABLE_NAME, id, serializer)
    .then(challenge => {
      cache.set(cacheKey, challenge);
      return resolve(challenge);
    })
    .catch(reject);
}

function _fetchChallenges(cacheKey, resolve, reject, filterFunction) {
  // TODO: use the ChallengeDataSource and not directly airtable
  airtable.getRecords(AIRTABLE_TABLE_NAME, {}, serializer)
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

    // TODO: use the ChallengeDataSource and not directly airtable
    return airtable.getRecords(AIRTABLE_TABLE_NAME, { view: competence.reference }, serializer)
      .then(fetchedChallenges => {
        cache.set(cacheKey, fetchedChallenges);
        return Promise.resolve(fetchedChallenges);
      });
  },

  // TODO: Bascule vers le nouveau getRecord
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

  // TODO: delete
  /**
   * @deprecated use the generic refresh endpoint
   */
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

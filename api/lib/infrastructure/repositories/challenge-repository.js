const cache = require('../cache');
const airtable = require('../airtable');
const serializer = require('../serializers/airtable/challenge-serializer');

const Challenge = require('../../domain/models/Challenge');
const Skill = require('../../domain/models/Skill');

const challengeDatasource = require('../datasources/airtable/challenge-datasource');
const skillDatasource = require('../datasources/airtable/skill-datasource');
const airtableDatasourceObjects = require('../datasources/airtable/objects');
const { NotFoundError } = require('../../domain/errors');

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

function _getSkillDataObjects(challengeDataObject) {
  const skillDataObjectPromises = challengeDataObject.skillIds.map(skillDatasource.get);
  return Promise.all(skillDataObjectPromises);
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

  get(id) {

    let challengeDataObject;

    return challengeDatasource.get(id)
      .then((result) => challengeDataObject = result)
      // TODO: Il manque le trigger d'une airtableDatasourceObjects.AirtableResourceNotFound
      .then(_getSkillDataObjects)
      .then((skillDataObjects) => {

        const skills = skillDataObjects.map((skillDataObject) => new Skill(skillDataObject));

        return new Challenge({
          id: challengeDataObject.id,
          type: challengeDataObject.type,
          instruction: challengeDataObject.instruction,
          competence: challengeDataObject.competence,
          proposals: challengeDataObject.proposals,
          timer: challengeDataObject.timer,
          illustrationUrl: challengeDataObject.illustrationUrl,
          attachments: challengeDataObject.attachments,
          skills,
          embedUrl: challengeDataObject.embedUrl,
          embedTitle: challengeDataObject.embedTitle,
          embedHeight: challengeDataObject.embedHeight,
        });
      })
      .catch(error => {
        if(error instanceof airtableDatasourceObjects.AirtableResourceNotFound) {
          throw new NotFoundError();
        }

        throw error;
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

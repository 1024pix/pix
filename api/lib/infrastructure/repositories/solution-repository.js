const cache = require('../cache');
const airtable = require('../airtable');
const serializer = require('../serializers/airtable/solution-serializer');
const Solution = require('../../domain/models/Solution');
const challengeDatasource = require('../datasources/airtable/challenge-datasource');
const _ = require('../../../lib/infrastructure/utils/lodash-utils');

const AIRTABLE_TABLE_NAME = 'Epreuves';

function _fetchSolution(id, cacheKey, resolve, reject) {
  return airtable.getRecord(AIRTABLE_TABLE_NAME, id, serializer)
    .then(solution => {
      cache.set(cacheKey, solution);
      return resolve(solution);
    })
    .catch(reject);
}

module.exports = {

  // TODO: delete Or replace by get(solutionId) --> same behaviour than getByChallengeId
  /**
   * @deprecated use getByChallengeId function instead
   */
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

  getByChallengeId(challengeId) {
    return challengeDatasource.get(challengeId)
      .then((challengeDataModel) => {
        const scoring = _.ensureString(challengeDataModel.scoring).replace(/@/g, ''); // XXX YAML ne supporte pas @

        return new Solution({
          id: challengeDataModel.id,
          isT1Enabled: challengeDataModel.t1Status !== 'Désactivé',
          isT2Enabled: challengeDataModel.t2Status !== 'Désactivé',
          isT3Enabled: challengeDataModel.t3Status !== 'Désactivé',
          type: challengeDataModel.type,
          value: challengeDataModel.solution,
          scoring
        });
      });
  }
};


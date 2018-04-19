const Solution = require('../../domain/models/Solution');
const challengeDatasource = require('../datasources/airtable/challenge-datasource');
const _ = require('../../../lib/infrastructure/utils/lodash-utils');

module.exports = {

  // TODO: delete Or replace by get(solutionId) --> same behaviour than getByChallengeId
  /**
   * @deprecated use getByChallengeId function instead
   */
  get: this.getByChallengeId,

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


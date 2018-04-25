const Solution = require('../../domain/models/Solution');
const challengeDatasource = require('../datasources/airtable/challenge-datasource');
const _ = require('../../../lib/infrastructure/utils/lodash-utils');

module.exports = {

  getByChallengeId(challengeId) {
    return challengeDatasource.get(challengeId)
      .then((challengeDataObject) => {
        const scoring = _.ensureString(challengeDataObject.scoring).replace(/@/g, ''); // XXX YAML ne supporte pas @

        return new Solution({
          id: challengeDataObject.id,
          isT1Enabled: challengeDataObject.t1Status !== 'Désactivé',
          isT2Enabled: challengeDataObject.t2Status !== 'Désactivé',
          isT3Enabled: challengeDataObject.t3Status !== 'Désactivé',
          type: challengeDataObject.type,
          value: challengeDataObject.solution,
          scoring
        });
      });
  }
};


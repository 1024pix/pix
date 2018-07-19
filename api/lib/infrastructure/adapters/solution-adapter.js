const Solution = require('../../domain/models/Solution');
const _ = require('../../../lib/infrastructure/utils/lodash-utils');

module.exports = {

  fromChallengeAirtableDataObject(challengeAirtableDataObject) {
    const scoring = _.ensureString(challengeAirtableDataObject.scoring).replace(/@/g, ''); // XXX YAML ne supporte pas @

    return new Solution({
      id: challengeAirtableDataObject.id,
      isT1Enabled: challengeAirtableDataObject.t1Status !== 'Désactivé',
      isT2Enabled: challengeAirtableDataObject.t2Status !== 'Désactivé',
      isT3Enabled: challengeAirtableDataObject.t3Status !== 'Désactivé',
      type: challengeAirtableDataObject.type,
      value: challengeAirtableDataObject.solution,
      scoring
    });
  },
};


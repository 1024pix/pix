const CertificationChallengeWithType = require('../../../../lib/domain/models/CertificationChallengeWithType');
const Challenge = require('../../../../lib/domain/models/Challenge');

module.exports = function buildCertificationChallengeWithType({
  id = 123,
  challengeId = 'recCHAL',
  competenceId = 'recCOMP',
  type = Challenge.Type.QCU,
  associatedSkillName = 'cueillir des fleurs',
  isNeutralized = false,
  hasBeenSkippedAutomatically = false,
  certifiableBadgeKey = null,
} = {}) {
  return new CertificationChallengeWithType({
    id,
    challengeId,
    competenceId,
    associatedSkillName,
    type,
    isNeutralized,
    hasBeenSkippedAutomatically,
    certifiableBadgeKey,
  });
};

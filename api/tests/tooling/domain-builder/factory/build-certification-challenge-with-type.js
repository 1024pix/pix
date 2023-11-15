import { CertificationChallengeWithType } from '../../../../lib/domain/models/CertificationChallengeWithType.js';
import { Challenge } from '../../../../src/shared/domain/models/Challenge.js';

const buildCertificationChallengeWithType = function ({
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

export { buildCertificationChallengeWithType };

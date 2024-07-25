import { CertificationChallengeWithType } from '../../../../src/shared/domain/models/CertificationChallengeWithType.js';
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
  createdAt = new Date('2020-01-01'),
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
    createdAt,
  });
};

export { buildCertificationChallengeWithType };

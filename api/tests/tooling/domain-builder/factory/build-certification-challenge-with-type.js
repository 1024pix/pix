import { CertificationChallengeWithType } from '../../../../src/certification/shared/domain/models/CertificationChallengeWithType.js';
import { TYPES } from '../../../../src/shared/domain/models/BaseChallenge.js';

const buildCertificationChallengeWithType = function ({
  id = 123,
  challengeId = 'recCHAL',
  competenceId = 'recCOMP',
  type = TYPES.QCU,
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

import CertificationChallengeWithType from '../../../../lib/domain/models/CertificationChallengeWithType';
import Challenge from '../../../../lib/domain/models/Challenge';

export default function buildCertificationChallengeWithType({
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
}

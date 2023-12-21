import { V3CertificationChallengeForAdministration } from '../../../../src/certification/course/domain/models/V3CertificationChallengeForAdministration.js';

export const buildV3CertificationChallengeForAdministration = ({
  challengeId,
  answerStatus,
  validatedLiveAlert,
  answeredAt,
  competenceId,
  skillName,
}) => {
  return new V3CertificationChallengeForAdministration({
    challengeId,
    answerStatus,
    validatedLiveAlert,
    answeredAt,
    competenceId,
    skillName,
  });
};

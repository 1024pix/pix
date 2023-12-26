import { V3CertificationChallengeForAdministration } from '../../../../src/certification/course/domain/models/V3CertificationChallengeForAdministration.js';

export const buildV3CertificationChallengeForAdministration = ({
  challengeId,
  answerStatus,
  answerValue,
  validatedLiveAlert,
  answeredAt,
  competenceId,
  skillName,
  competenceName,
  competenceIndex,
}) => {
  return new V3CertificationChallengeForAdministration({
    challengeId,
    answerStatus,
    answerValue,
    validatedLiveAlert,
    answeredAt,
    competenceId,
    skillName,
    competenceName,
    competenceIndex,
  });
};

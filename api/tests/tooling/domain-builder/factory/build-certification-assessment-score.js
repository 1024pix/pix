import { CertificationAssessmentScore } from '../../../../lib/shared/domain/models/CertificationAssessmentScore.js';

const buildCertificationAssessmentScore = function ({
  competenceMarks = [],
  percentageCorrectAnswers = 0,
  hasEnoughNonNeutralizedChallengesToBeTrusted = true,
} = {}) {
  return new CertificationAssessmentScore({
    competenceMarks,
    percentageCorrectAnswers,
    hasEnoughNonNeutralizedChallengesToBeTrusted,
  });
};

export { buildCertificationAssessmentScore };

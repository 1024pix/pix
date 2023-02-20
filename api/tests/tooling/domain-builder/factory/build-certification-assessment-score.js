import CertificationAssessmentScore from '../../../../lib/domain/models/CertificationAssessmentScore';

export default function buildCertificationAssessmentScore({
  competenceMarks = [],
  percentageCorrectAnswers = 0,
  hasEnoughNonNeutralizedChallengesToBeTrusted = true,
} = {}) {
  return new CertificationAssessmentScore({
    competenceMarks,
    percentageCorrectAnswers,
    hasEnoughNonNeutralizedChallengesToBeTrusted,
  });
}

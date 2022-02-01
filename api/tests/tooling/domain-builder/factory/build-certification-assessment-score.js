const CertificationAssessmentScore = require('../../../../lib/domain/models/CertificationAssessmentScore');

module.exports = function buildCertificationAssessmentScore({
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

const CertificationAssessmentScore = require('../../../../lib/domain/models/CertificationAssessmentScore');

module.exports = function buildCertificationAssessmentScore({
  competenceMarks = [],
  percentageCorrectAnswers = 0,
} = {}) {
  return new CertificationAssessmentScore({
    competenceMarks,
    percentageCorrectAnswers,
  });
};

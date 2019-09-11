const AssessmentScore = require('../../models/AssessmentScore');
const scoringCertification = require('./scoring-certification');

async function calculateAssessmentScore(dependencies, assessment) {

  if (!assessment.canBeScored()) {
    return new AssessmentScore();
  }

  if (assessment.isCertification()) {
    return scoringCertification.calculate(assessment);
  }
}

module.exports = {
  calculateAssessmentScore,
};

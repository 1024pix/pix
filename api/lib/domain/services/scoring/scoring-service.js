const AssessmentScore = require('../../models/AssessmentScore');
const scoringPlacement = require('./scoring-placement');
const scoringCertification = require('./scoring-certification');

async function calculateAssessmentScore(dependencies, assessment) {

  if (!assessment.canBeScored()) {
    return new AssessmentScore();
  }

  if (assessment.isPlacement()) {
    return scoringPlacement.calculate(dependencies, assessment);
  }

  if (assessment.isCertification()) {
    return scoringCertification.calculate(assessment);
  }
}

module.exports = {
  calculateAssessmentScore,
};

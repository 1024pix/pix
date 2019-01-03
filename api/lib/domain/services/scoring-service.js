const AssessmentScore = require('../models/AssessmentScore');
const scoringPlacement = require('../strategies/scoring/scoring-placement');
const scoringCertification = require('../strategies/scoring/scoring-certification');

async function calculateAssessmentScore(dependencies, assessment) {

  if (!assessment.canBeScored()) {
    return new AssessmentScore();
  }

  if (assessment.isPlacement()) {
    return scoringPlacement.calculate(dependencies, assessment);
  }

  if (assessment.isCertification()) {
    return scoringCertification.calculate(dependencies, assessment);
  }
}

module.exports = {
  calculateAssessmentScore,
};

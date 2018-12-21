const AssessmentScore = require('../models/AssessmentScore');
const scoringPlacement = require('../strategies/scoring/scoring-placement');
const scoringCertification = require('../strategies/scoring/scoring-certification');

async function calculateAssessmentScore(dependencies, assessment) {

  let assessmentScore;

  if (!assessment.canBeScored()) {
    assessmentScore = new AssessmentScore();
  }

  if (assessment.hasTypePlacement()) {
    assessmentScore = await scoringPlacement.calculate(dependencies, assessment);
  }

  if (assessment.hasTypeCertification()) {
    assessmentScore = await scoringCertification.calculate(dependencies, assessment);
  }

  return assessmentScore;
}

module.exports = {
  calculateAssessmentScore,
};

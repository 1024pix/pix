const CertificationAssessmentScore = require('../../models/CertificationAssessmentScore');
const certificationResultService = require('../../services/certification-result-service');

async function calculateCertificationAssessmentScore({ certificationAssessment, continueOnError }) {

  const { competencesWithMark, percentageCorrectAnswers } = await certificationResultService.computeResult({ certificationAssessment, continueOnError });

  return new CertificationAssessmentScore({
    competenceMarks: competencesWithMark,
    percentageCorrectAnswers,
  });
}

module.exports = {
  calculateCertificationAssessmentScore,
};

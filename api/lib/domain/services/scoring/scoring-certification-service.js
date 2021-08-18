const certificationResultService = require('./certification-result-service');

async function calculateCertificationAssessmentScore({ certificationAssessment, continueOnError }) {
  return await certificationResultService.computeResult({ certificationAssessment, continueOnError });
}

module.exports = {
  calculateCertificationAssessmentScore,
};

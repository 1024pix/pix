const CertificationAssessmentScore = require('../../models/CertificationAssessmentScore');
const CompetenceMark = require('../../models/CompetenceMark');
const certificationService = require('../../services/certification-service');
const scoringService = require('../../services/scoring/scoring-service');

async function calculateCertificationAssessmentScore(certificationAssessment) {

  const { competencesWithMark, percentageCorrectAnswers } = await certificationService.calculateCertificationResultByAssessmentId(certificationAssessment.id);

  const competenceMarks = competencesWithMark.map((certifiedCompetence) => {
    return new CompetenceMark({
      level: scoringService.getBlockedLevel(certifiedCompetence.obtainedLevel),
      score: scoringService.getBlockedPixScore(certifiedCompetence.obtainedScore),
      area_code: certifiedCompetence.area_code,
      competence_code: certifiedCompetence.index,
    });
  });

  return new CertificationAssessmentScore({
    competenceMarks,
    percentageCorrectAnswers,
  });
}

module.exports = {
  calculateCertificationAssessmentScore,
};

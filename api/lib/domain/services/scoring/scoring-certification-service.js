const AssessmentScore = require('../../models/AssessmentScore');
const CompetenceMark = require('../../models/CompetenceMark');
const certificationService = require('../../services/certification-service');
const scoringService = require('../../services/scoring/scoring-service');
const _ = require('lodash');

async function calculateAssessmentScore(assessment) {

  const { competencesWithMark, percentageCorrectAnswers } = await certificationService.calculateCertificationResultByAssessmentId(assessment.id);

  const competenceMarks = competencesWithMark.map((certifiedCompetence) => {
    return new CompetenceMark({
      level: scoringService.getBlockedLevel(certifiedCompetence.obtainedLevel),
      score: scoringService.getBlockedPixScore(certifiedCompetence.obtainedScore),
      area_code: certifiedCompetence.area_code,
      competence_code: certifiedCompetence.index,
    });
  });

  return new AssessmentScore({
    nbPix: _.sumBy(competenceMarks, 'score'),
    competenceMarks,
    percentageCorrectAnswers,
  });
}

module.exports = {
  calculateAssessmentScore,
};

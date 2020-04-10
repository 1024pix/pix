const {
  MAX_REACHABLE_LEVEL,
  MAX_REACHABLE_PIX_BY_COMPETENCE,
} = require('../../constants');

const AssessmentScore = require('../../models/AssessmentScore');
const CompetenceMark = require('../../models/CompetenceMark');
const certificationService = require('../../services/certification-service');
const _ = require('lodash');

async function calculateAssessmentScore(assessment) {

  const { competencesWithMark, percentageCorrectAnswers } = await certificationService.calculateCertificationResultByAssessmentId(assessment.id);

  const competenceMarks = competencesWithMark.map((certifiedCompetence) => {
    return new CompetenceMark({
      level: Math.min(certifiedCompetence.obtainedLevel, MAX_REACHABLE_LEVEL),
      score: Math.min(certifiedCompetence.obtainedScore, MAX_REACHABLE_PIX_BY_COMPETENCE),
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

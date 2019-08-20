const _ = require('lodash');
const AssessmentScore = require('../../models/AssessmentScore');
const CompetenceMark = require('../../models/CompetenceMark');
const certificationService = require('../../services/certification-service');

async function calculate(assessment) {

  const { competencesWithMark } = await certificationService.calculateCertificationResultByAssessmentId(assessment.id);

  const competenceMarks = competencesWithMark.map((certifiedCompetence) => {
    return new CompetenceMark({
      level: certifiedCompetence.obtainedLevel,
      score: certifiedCompetence.obtainedScore,
      area_code: certifiedCompetence.area_code,
      competence_code: certifiedCompetence.index,
    });
  });

  return new AssessmentScore({
    nbPix: _.sumBy(competenceMarks, 'score'),
    competenceMarks,
  });
}

module.exports = {
  calculate,
};

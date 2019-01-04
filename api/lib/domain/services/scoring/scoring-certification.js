const scoringFormulas = require('./scoring-formulas.js');
const AssessmentScore = require('../../models/AssessmentScore');
const CompetenceMark = require('../../models/CompetenceMark');

const certificationService = require('../../services/certification-service');

module.exports = {

  async calculate({ competenceRepository }, assessment) {

    const [competences, { competencesWithMark }] = await Promise.all([
      competenceRepository.list(),
      certificationService.calculateCertificationResultByAssessmentId(assessment.id)
    ]);

    const competenceMarks = competencesWithMark.map((certifiedCompetence) => {

      const area_code = competences.find((competence) => {
        return competence.index === certifiedCompetence.index;
      }).area.code;

      return new CompetenceMark({
        level: certifiedCompetence.obtainedLevel,
        score: certifiedCompetence.obtainedScore,
        area_code,
        competence_code: certifiedCompetence.index,
      });
    });

    const competencesPixScore = competenceMarks.map((competenceMark) => competenceMark.score);

    const nbPix = scoringFormulas.computeTotalPixScore(competencesPixScore);

    return new AssessmentScore({
      nbPix,
      competenceMarks,
    });
  }
};

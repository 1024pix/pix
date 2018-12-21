const scoringFormulas = require('./scoring-formulas.js');
const AssessmentScore = require('../../models/AssessmentScore');
const CompetenceMark = require('../../models/CompetenceMark');

const certificationService = require('../../services/certification-service');

module.exports = {

  async calculate({ competenceRepository }, assessment) {

    // 1. Fetch data

    const [competences, { competencesWithMark }] = await Promise.all([
      competenceRepository.list(),
      certificationService.calculateCertificationResultByAssessmentId(assessment.id)
    ]);

    // 2. Process data

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

    // 3. Format response

    return new AssessmentScore({
      nbPix,
      competenceMarks,
    });
  }
};

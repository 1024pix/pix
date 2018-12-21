const scoringUtils = require('./scoring-utils.js');
const AssessmentScore = require('../../models/AssessmentScore');
const CompetenceMark = require('../../models/CompetenceMark');

module.exports = {

  async calculate({ answerRepository, certificationService, competenceRepository }, assessment) {

    // 1. Fetch data

    const [answers, competences, { competencesWithMark }] = await Promise.all([
      answerRepository.findByAssessment(assessment.id),
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

    const nbPixByCompetence = competenceMarks.map((competenceMark) => competenceMark.score);

    const nbPix = scoringUtils.computeTotalPixScore(nbPixByCompetence);

    const level = scoringUtils.computeLevel(assessment.pixScore);

    const successRate = scoringUtils.computeAnswersSuccessRate(answers);

    // 3. Format response

    return new AssessmentScore({
      level,
      nbPix,
      successRate,
      competenceMarks,
    });
  }
};

const scoringService = require('../services/scoring-service');

module.exports = async function getAssessment(
  {
    // arguments
    assessmentId,
    // dependencies
    answerRepository,
    assessmentRepository,
    challengeRepository,
    competenceRepository,
    courseRepository,
    skillRepository,
  }) {

  const dependencies = { answerRepository, challengeRepository, competenceRepository, courseRepository, skillRepository };

  const assessment = await await assessmentRepository.get(assessmentId);

  const assessmentScore = await scoringService.calculateAssessmentScore(dependencies, assessment);

  assessment.pixScore = assessmentScore.nbPix;
  assessment.estimatedLevel = assessmentScore.level;
  assessment.successRate = assessmentScore.successRate;

  return assessment;

};

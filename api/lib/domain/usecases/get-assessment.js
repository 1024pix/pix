const scoringService = require('../services/scoring-service');
const { NotFoundError } = require('../errors');

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

  const assessment = await assessmentRepository.get(assessmentId);

  if (!assessment) {
    throw new NotFoundError(`Assessment not found for ID ${assessmentId}`);
  }

  const assessmentScore = await scoringService.calculateAssessmentScore(dependencies, assessment);

  assessment.estimatedLevel = assessmentScore.level;
  assessment.pixScore = assessmentScore.nbPix;

  return assessment;

};

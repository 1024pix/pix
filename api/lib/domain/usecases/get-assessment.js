const { MAX_REACHABLE_LEVEL } = require('../../../lib/domain/models/Profile');
const scoringService = require('../services/scoring/scoring-service');
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

  /*
   * FIXME
   * Le score et le niveau ne sont utilisés que dans l'affichage de la page de résultat d'un parcours de positionnement
   * par compétence. Il faudrait sortir ces informations dans une sous-ressource de Assessment et faire un appel de plus
   * dans le front plutôt qu'engager un calcul lourd à chaque affichage d'épreuve ou chaque récupération d'assessment.
   */
  const assessmentScore = await scoringService.calculateAssessmentScore(dependencies, assessment);
  assessment.estimatedLevel = Math.min(assessmentScore.level, MAX_REACHABLE_LEVEL);
  assessment.pixScore = assessmentScore.nbPix;

  return assessment;

};

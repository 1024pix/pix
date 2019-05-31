const { NotFoundError } = require('../errors');
const { MAX_REACHABLE_LEVEL } = require('../constants');

module.exports = async function getAssessment(
  {
    // arguments
    assessmentId,
    // dependencies
    assessmentRepository,
    competenceRepository,
    competenceEvaluationRepository,
  }) {
  const assessment = await assessmentRepository.get(assessmentId);
  if (!assessment) {
    throw new NotFoundError(`Assessment not found for ID ${assessmentId}`);
  }
  const assessmentResult = assessment.getLastAssessmentResult();

  if (assessmentResult) {
    assessment.estimatedLevel = Math.min(assessmentResult.level, MAX_REACHABLE_LEVEL);
    assessment.pixScore = assessmentResult.pixScore;
  } else {
    assessment.estimatedLevel = null;
    assessment.pixScore = null;
  }

  if (assessment.type === 'COMPETENCE_EVALUATION') {
    const competenceEvaluation = await competenceEvaluationRepository.getByAssessmentId(assessmentId);
    assessment.title = await _fetchCompetenceName(competenceEvaluation.competenceId, competenceRepository);
  }

  return assessment;
};

function _fetchCompetenceName(competenceId, competenceRepository) {
  return competenceRepository.get(competenceId)
    .then((competence) => {
      return competence.name;
    })
    .catch(() => {
      throw new NotFoundError('La compétence demandée n\'existe pas');
    });
}

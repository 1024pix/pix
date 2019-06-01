const { NotFoundError } = require('../errors');
const { MAX_REACHABLE_LEVEL } = require('../constants');
const Assessment = require('../models/Assessment');

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

  assessment.title = await _fetchAssessmentTitle({
    assessment,
    competenceEvaluationRepository,
    competenceRepository
  });

  return assessment;
};

async function _fetchAssessmentTitle({ assessment, competenceEvaluationRepository, competenceRepository }) {
  switch (assessment.type) {
    case Assessment.types.COMPETENCE_EVALUATION : {
      const competenceEvaluation = await competenceEvaluationRepository.getByAssessmentId(assessment.id);
      return await _fetchCompetenceName(competenceEvaluation.competenceId, competenceRepository);
    }

    case Assessment.types.SMARTPLACEMENT : {
      return assessment.campaignParticipation.campaign.title;
    }

    default:
      return undefined;
  }
}

function _fetchCompetenceName(competenceId, competenceRepository) {
  return competenceRepository.get(competenceId)
    .then((competence) => {
      return competence.name;
    })
    .catch(() => {
      throw new NotFoundError('La compétence demandée n\'existe pas');
    });
}

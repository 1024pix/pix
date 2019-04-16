const Progression = require('../../../lib/domain/models/Progression');

module.exports = async function getProgression(
  {
    progressionId,
    userId,
    assessmentRepository,
    competenceEvaluationRepository,
    smartPlacementAssessmentRepository,
    smartPlacementKnowledgeElementRepository,
    skillRepository
  }) {

  const assessmentId = Progression.getAssessmentIdFromId(progressionId);

  const assessment = await assessmentRepository.getByUserIdAndAssessmentId(assessmentId, userId);
  let progression;

  if (assessment.isSmartPlacement()) {
    const smartPlacementAssessment = await smartPlacementAssessmentRepository.get(assessmentId);
    const knowledgeElementsBeforeSharedDate = await smartPlacementKnowledgeElementRepository.findUniqByUserId({ userId, limitDate: smartPlacementAssessment.campaignParticipation.sharedAt });

    progression = new Progression({
      id: progressionId,
      targetedSkills: smartPlacementAssessment.targetProfile.skills,
      knowledgeElements: knowledgeElementsBeforeSharedDate,
      isProfileCompleted: smartPlacementAssessment.isCompleted
    });
  }

  if (assessment.isCompetenceEvaluation()) {
    const competenceEvaluation = await competenceEvaluationRepository.getByAssessmentId(assessmentId);
    const [targetedSkills, knowledgeElements] = await Promise.all([
      skillRepository.findByCompetenceId(competenceEvaluation.competenceId),
      smartPlacementKnowledgeElementRepository.findUniqByUserId({ userId })]
    );

    progression = new Progression({
      id: progressionId,
      targetedSkills,
      knowledgeElements,
      isProfileCompleted: assessment.isCompleted()
    });
  }

  return progression;
};

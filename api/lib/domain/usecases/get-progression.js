const Progression = require('../../../lib/domain/models/Progression');

module.exports = async function getProgression(
  {
    progressionId,
    userId,
    assessmentRepository,
    competenceEvaluationRepository,
    campaignAssessmentRepository,
    knowledgeElementRepository,
    skillRepository,
    improvementService,
  }) {

  const assessmentId = Progression.getAssessmentIdFromId(progressionId);

  const assessment = await assessmentRepository.getByAssessmentIdAndUserId(assessmentId, userId);
  let progression;

  if (assessment.isForCampaign()) {
    const campaignAssessment = await campaignAssessmentRepository.get(assessmentId);
    const knowledgeElementsBeforeSharedDate = await knowledgeElementRepository.findUniqByUserId({ userId, limitDate: campaignAssessment.campaignParticipation.sharedAt });
    const knowledgeElementsForProgression = await improvementService.filterKnowledgeElementsIfImproving({
      knowledgeElements: knowledgeElementsBeforeSharedDate,
      assessment
    });

    progression = new Progression({
      id: progressionId,
      targetedSkills: campaignAssessment.targetProfile.skills,
      knowledgeElements: knowledgeElementsForProgression,
      isProfileCompleted: campaignAssessment.isCompleted
    });
  }

  if (assessment.isCompetenceEvaluation()) {
    const competenceEvaluation = await competenceEvaluationRepository.getByAssessmentId(assessmentId);
    const [targetedSkills, knowledgeElements] = await Promise.all([
      skillRepository.findByCompetenceId(competenceEvaluation.competenceId),
      knowledgeElementRepository.findUniqByUserId({ userId })]
    );
    const knowledgeElementsForProgression = await improvementService.filterKnowledgeElementsIfImproving({
      knowledgeElements,
      assessment
    });

    progression = new Progression({
      id: progressionId,
      targetedSkills,
      knowledgeElements: knowledgeElementsForProgression,
      isProfileCompleted: assessment.isCompleted()
    });
  }

  return progression;
};

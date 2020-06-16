const Progression = require('../../../lib/domain/models/Progression');

module.exports = async function getProgression(
  {
    progressionId,
    userId,
    assessmentRepository,
    competenceEvaluationRepository,
    campaignParticipationRepository,
    knowledgeElementRepository,
    skillRepository,
    targetProfileRepository,
    improvementService,
  }) {

  const assessmentId = Progression.getAssessmentIdFromId(progressionId);

  const assessment = await assessmentRepository.getByAssessmentIdAndUserId(assessmentId, userId);
  let progression;

  if (assessment.isForCampaign()) {
    const campaignParticipation = await campaignParticipationRepository.get(assessment.campaignParticipationId);
    const targetProfile = await targetProfileRepository.getByCampaignId(campaignParticipation.campaignId);
    const knowledgeElementsBeforeSharedDate = await knowledgeElementRepository.findUniqByUserId({ userId, limitDate: campaignParticipation.sharedAt });

    const knowledgeElementsForProgression = await improvementService.filterKnowledgeElementsIfImproving({
      knowledgeElements: knowledgeElementsBeforeSharedDate,
      assessment
    });

    progression = new Progression({
      id: progressionId,
      targetedSkills: targetProfile.skills,
      knowledgeElements: knowledgeElementsForProgression,
      isProfileCompleted: assessment.isCompleted(),
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

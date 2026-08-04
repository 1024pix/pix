import { Progression } from '../models/Progression.js';

export async function getCampaignProgression({
  assessment,
  progressionId,
  campaignParticipationRepository,
  campaignRepository,
  knowledgeElementForParticipationService,
  improvementService,
}) {
  const campaignParticipation = await campaignParticipationRepository.get(assessment.campaignParticipationId);

  const skillIds = await campaignRepository.findSkillIds({ campaignId: campaignParticipation.campaignId });

  const knowledgeElementsBeforeSharedDate =
    await knowledgeElementForParticipationService.findUniqByUserOrCampaignParticipationId({
      userId: assessment.userId,
      campaignParticipationId: campaignParticipation.id,
      limitDate: campaignParticipation.sharedAt,
    });

  const knowledgeElements = improvementService.filterKnowledgeElements({
    knowledgeElements: knowledgeElementsBeforeSharedDate,
    createdAt: assessment.createdAt,
    isFromCampaign: true,
    isImproving: true,
  });

  return new Progression({
    id: progressionId ?? Progression.generateIdFromAssessmentId(assessment.id),
    skillIds,
    knowledgeElements,
    isProfileCompleted: assessment.isCompleted(),
  });
}

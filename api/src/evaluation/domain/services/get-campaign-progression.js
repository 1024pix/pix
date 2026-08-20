import { Progression } from '../models/Progression.js';

export async function getCampaignProgression({
  assessment,
  progressionId,
  campaignParticipationRepository,
  campaignRepository,
  knowledgeStateForParticipationService,
  improvementService,
}) {
  const campaignParticipation = await campaignParticipationRepository.get(assessment.campaignParticipationId);

  const skillIds = await campaignRepository.findSkillIds({ campaignId: campaignParticipation.campaignId });

  const knowledgeStateBeforeSharedDate =
    await knowledgeStateForParticipationService.findByUserOrCampaignParticipationId({
      userId: assessment.userId,
      campaignParticipationId: campaignParticipation.id,
      limitDate: campaignParticipation.sharedAt,
    });

  const knowledgeState = improvementService.improveKnowledgeState({
    knowledgeState: knowledgeStateBeforeSharedDate,
    createdAt: assessment.createdAt,
    isFromCampaign: true,
    isImproving: true,
  });

  return new Progression({
    id: progressionId ?? Progression.generateIdFromAssessmentId(assessment.id),
    skillIds,
    knowledgeState,
    isProfileCompleted: assessment.isCompleted(),
  });
}

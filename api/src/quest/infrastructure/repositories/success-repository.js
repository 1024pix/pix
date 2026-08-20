import { Success } from '../../domain/models/quests/aggregates/Success.js';

export const find = async ({
  userId,
  campaignParticipationIds,
  targetProfileIds,
  knowledgeStatesApi,
  skillsApi,
  campaignsApi,
  targetProfilesApi,
}) => {
  const targetProfileSkills = await targetProfilesApi.findSkillsByTargetProfileIds(targetProfileIds);
  const knowledgeState = await knowledgeStatesApi.getKnowledgeStateForUser({ userId });
  const campaignSkillIds = await campaignsApi.findCampaignSkillIdsForCampaignParticipations(campaignParticipationIds);
  const campaignSkills = await skillsApi.findByIds({
    ids: campaignSkillIds,
  });
  return new Success({ knowledgeState, campaignSkills, targetProfileSkills });
};

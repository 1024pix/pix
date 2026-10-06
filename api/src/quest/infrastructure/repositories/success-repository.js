import { Success } from '../../domain/models/quests/aggregates/Success.ts';

export const find = async ({
  userId,
  campaignParticipationIds,
  targetProfileIds,
  knowledgeElementsApi,
  skillsApi,
  campaignsApi,
  targetProfilesApi,
}) => {
  const targetProfileSkills = await targetProfilesApi.findSkillsByTargetProfileIds(targetProfileIds);
  const knowledgeElements = await knowledgeElementsApi.findFilteredMostRecentByUser({ userId });
  const campaignSkillIds = await campaignsApi.findCampaignSkillIdsForCampaignParticipations(campaignParticipationIds);
  const campaignSkills = await skillsApi.findByIds({
    ids: campaignSkillIds,
  });
  return new Success({ knowledgeElements, campaignSkills, targetProfileSkills });
};

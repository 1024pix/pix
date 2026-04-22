import { Success } from '../../domain/models/Success.js';

export const find = async ({
  userId,
  campaignParticipationIds,
  targetProfileIds,
  quest,
  knowledgeElementsApi,
  skillsApi,
  campaignsApi,
  targetProfilesApi,
}) => {
  const dataNeeds = quest.getDataNeeds();

  const [knowledgeElements, campaignSkills, targetProfileSkills] = await Promise.all([
    dataNeeds.needsKnowledgeElements
      ? knowledgeElementsApi.findFilteredMostRecentByUser({ userId })
      : Promise.resolve([]),
    dataNeeds.needsCampaignSkills
      ? campaignsApi
          .findCampaignSkillIdsForCampaignParticipations(campaignParticipationIds)
          .then((ids) => skillsApi.findByIds({ ids }))
      : Promise.resolve([]),
    dataNeeds.needsTargetProfileSkills
      ? targetProfilesApi.findSkillsByTargetProfileIds(targetProfileIds)
      : Promise.resolve([]),
  ]);

  return new Success({ knowledgeElements, campaignSkills, targetProfileSkills });
};

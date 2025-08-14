import { Success } from '../../domain/models/Success.js';

import * as injectedKnowledgeElementsApi from '../../../evaluation/application/api/knowledge-elements-api.js';import * as injectedSkillsApi from '../../../learning-content/application/api/skills-api.js';import * as injectedCampaignsApi from '../../../prescription/campaign/application/api/campaigns-api.js';import * as injectedTargetProfilesApi from '../../../prescription/target-profile/application/api/target-profile-api.js';

export const find = async (
  {
    userId,
    campaignParticipationIds,
    targetProfileIds,
    knowledgeElementsApi = injectedKnowledgeElementsApi,
    skillsApi = injectedSkillsApi,
    campaignsApi = injectedCampaignsApi,
    targetProfilesApi = injectedTargetProfilesApi,
  } = {},
) => {
  const targetProfileSkills = await targetProfilesApi.findSkillsByTargetProfileIds(targetProfileIds);
  const knowledgeElements = await knowledgeElementsApi.findFilteredMostRecentByUser({ userId });
  const campaignSkillIds = await campaignsApi.findCampaignSkillIdsForCampaignParticipations(campaignParticipationIds);
  const campaignSkills = await skillsApi.findByIds({
    ids: campaignSkillIds,
  });
  return new Success({ knowledgeElements, campaignSkills, targetProfileSkills });
};

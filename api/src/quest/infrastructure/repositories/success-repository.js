import { Skill } from '../../domain/models/Skill.js';
import { Success } from '../../domain/models/Success.js';

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
  const baseSkills = await skillsApi.findInIds({
    ids: campaignSkillIds,
  });
  const skillsFromCampaigns = baseSkills.map(
    (baseSkill) =>
      new Skill({
        id: baseSkill.id,
        difficulty: baseSkill.difficulty,
        tubeId: baseSkill.tubeId,
      }),
  );
  const skillsFromTargetProfile = targetProfileSkills.map(
    (targetProfileSkill) =>
      new Skill({
        id: targetProfileSkill.id,
        difficulty: targetProfileSkill.difficulty,
        tubeId: targetProfileSkill.tubeId,
      }),
  );
  return new Success({
    knowledgeElements,
    campaignSkills: skillsFromCampaigns,
    targetProfileSkills: skillsFromTargetProfile,
  });
};

import { buildCampaign } from './build-campaign.js';
import { buildCampaignSkill } from './build-campaign-skill.js';
import { CampaignTypes } from '../../../src/prescription/campaign/domain/read-models/CampaignTypes.js';

const buildAssessmentCampaignForSkills = function (attributes, skillSet) {
  attributes.type = CampaignTypes.ASSESSMENT;
  const campaign = buildCampaign(attributes);

  skillSet.forEach((skill) => buildCampaignSkill({ campaignId: campaign.id, skillId: skill.id }));
  return campaign;
};

export { buildAssessmentCampaignForSkills };

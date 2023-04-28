const buildCampaign = require('./build-campaign');
const buildCampaignSkill = require('./build-campaign-skill');
const CampaignTypes = require('../../../lib/domain/models/CampaignTypes');

module.exports = function buildAssessmentCampaignForSkills(attributes, skillSet) {
  attributes.type = CampaignTypes.ASSESSMENT;
  const campaign = buildCampaign(attributes);

  skillSet.forEach((skill) => buildCampaignSkill({ campaignId: campaign.id, skillId: skill.id }));
  return campaign;
};

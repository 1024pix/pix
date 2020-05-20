const buildCampaign = require('./build-campaign');
const buildTargetProfile = require('./build-target-profile');
const buildTargetProfileSkill = require('./build-target-profile-skill');
const Campaign = require('../../../../lib/domain/models/Campaign');

module.exports = function buildAssessmentCampaignForSkills(attributes, skillSet) {

  const targetProfileId = buildTargetProfile().id;
  skillSet.forEach((skill) => buildTargetProfileSkill({ targetProfileId, skillId: skill.id }));

  attributes.type = Campaign.types.ASSESSMENT;
  attributes.targetProfileId = targetProfileId;

  return buildCampaign(attributes);
};

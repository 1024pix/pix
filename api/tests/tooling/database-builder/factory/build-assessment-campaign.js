const buildAssessmentCampaignForSkills = require('./build-assessment-campaign-for-skills');
const Campaign = require('../../../../lib/domain/models/Campaign');

module.exports = function buildAssessmentCampaign(attributes, skills = [{ id: 'skill', name: 'skillName' }]) {
  attributes.type = Campaign.types.ASSESSMENT;

  return buildAssessmentCampaignForSkills(attributes, skills);
};

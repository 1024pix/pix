const buildAssessmentCampaignForSkills = require('./build-assessment-campaign-for-skills');
const CampaignTypes = require('../../../lib/domain/models/CampaignTypes');

module.exports = function buildAssessmentCampaign(attributes, skills = [{ id: 'skill', name: 'skillName' }]) {
  attributes.type = CampaignTypes.ASSESSMENT;

  return buildAssessmentCampaignForSkills(attributes, skills);
};

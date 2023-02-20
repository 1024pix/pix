import buildAssessmentCampaignForSkills from './build-assessment-campaign-for-skills';
import CampaignTypes from '../../../lib/domain/models/CampaignTypes';

export default function buildAssessmentCampaign(attributes, skills = [{ id: 'skill', name: 'skillName' }]) {
  attributes.type = CampaignTypes.ASSESSMENT;

  return buildAssessmentCampaignForSkills(attributes, skills);
}

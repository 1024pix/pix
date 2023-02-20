import buildCampaign from './build-campaign';
import buildTargetProfile from './build-target-profile';
import buildTargetProfileSkill from './build-target-profile-skill';
import CampaignTypes from '../../../lib/domain/models/CampaignTypes';

export default function buildAssessmentCampaignForSkills(attributes, skillSet) {
  const targetProfileId = buildTargetProfile().id;
  skillSet.forEach((skill) => buildTargetProfileSkill({ targetProfileId, skillId: skill.id }));

  attributes.type = CampaignTypes.ASSESSMENT;
  attributes.targetProfileId = targetProfileId;

  return buildCampaign(attributes);
}

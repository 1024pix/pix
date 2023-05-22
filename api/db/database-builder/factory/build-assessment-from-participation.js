import { buildAssessment } from './build-assessment.js';
import { buildUser } from './build-user.js';
import { buildCampaignParticipation } from './build-campaign-participation.js';
import { buildOrganizationLearner } from './build-organization-learner.js';

const buildAssessmentFromParticipation = function (campaignParticipation, organizationLearner, user) {
  const userId = buildUser(user).id;
  const organizationLearnerId = buildOrganizationLearner(organizationLearner).id;
  const campaignParticipationId = buildCampaignParticipation({
    ...campaignParticipation,
    userId,
    organizationLearnerId,
  }).id;

  return buildAssessment({ userId, campaignParticipationId });
};

export { buildAssessmentFromParticipation };

import { buildAssessment } from './build-assessment.js';
import { buildCampaignParticipation } from './build-campaign-participation.js';
import { buildOrganizationLearner } from './build-organization-learner.js';
import { buildUser } from './build-user.ts';

const buildAssessmentFromParticipation = function (campaignParticipation, organizationLearner, user) {
  const userId = buildUser(user).id;
  const organizationLearnerId = buildOrganizationLearner({ ...organizationLearner, userId }).id;
  const campaignParticipationId = buildCampaignParticipation({
    ...campaignParticipation,
    userId,
    organizationLearnerId,
  }).id;

  return buildAssessment({ userId, campaignParticipationId });
};

export { buildAssessmentFromParticipation };

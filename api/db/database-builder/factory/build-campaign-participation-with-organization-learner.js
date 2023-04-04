import { buildAssessment } from './build-assessment.js';
import { buildCampaignParticipation } from './build-campaign-participation.js';
import { buildOrganizationLearnerWithUser } from './build-organization-learner-with-user.js';

module.exports = (organizationLearner, campaignParticipation, withAssessment) => {
  const { userId, id: organizationLearnerId } = buildOrganizationLearnerWithUser(organizationLearner);
  const campaignParticipationCreated = buildCampaignParticipation({
    userId,
    organizationLearnerId,
    ...campaignParticipation,
  });
  if (withAssessment) {
    buildAssessment({ userId, campaignParticipationId: campaignParticipationCreated.id });
  }
  return campaignParticipationCreated;
};

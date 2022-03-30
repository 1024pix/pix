const buildAssessment = require('./build-assessment');
const buildCampaignParticipation = require('./build-campaign-participation');
const buildOrganizationLearnerWithUser = require('./build-organization-learner-with-user');

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

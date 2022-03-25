const buildAssessment = require('./build-assessment');
const buildCampaignParticipation = require('./build-campaign-participation');
const buildOrganizationLearnerWithUser = require('./build-organization-learner-with-user');

module.exports = (organizationLearner, campaignParticipation, withAssessment) => {
  const { userId, id: schoolingRegistrationId } = buildOrganizationLearnerWithUser(organizationLearner);
  const campaignParticipationCreated = buildCampaignParticipation({
    userId,
    schoolingRegistrationId,
    ...campaignParticipation,
  });
  if (withAssessment) {
    buildAssessment({ userId, campaignParticipationId: campaignParticipationCreated.id });
  }
  return campaignParticipationCreated;
};

const buildAssessment = require('./build-assessment.js');
const buildCampaignParticipation = require('./build-campaign-participation.js');
const buildOrganizationLearnerWithUser = require('./build-organization-learner-with-user.js');

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

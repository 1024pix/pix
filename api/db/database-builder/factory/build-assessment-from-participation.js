const buildAssessment = require('./build-assessment');
const buildUser = require('./build-user');
const buildCampaignParticipation = require('./build-campaign-participation');
const buildOrganizationLearner = require('./build-organization-learner');

module.exports = function buildAssessmentFromParticipation(campaignParticipation, schoolingRegistration, user) {
  const userId = buildUser(user).id;
  const schoolingRegistrationId = buildOrganizationLearner(schoolingRegistration).id;
  const campaignParticipationId = buildCampaignParticipation({
    ...campaignParticipation,
    userId,
    schoolingRegistrationId,
  }).id;

  return buildAssessment({ userId, campaignParticipationId });
};

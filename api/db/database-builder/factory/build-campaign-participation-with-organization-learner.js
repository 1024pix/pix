import buildAssessment from './build-assessment';
import buildCampaignParticipation from './build-campaign-participation';
import buildOrganizationLearnerWithUser from './build-organization-learner-with-user';

export default (organizationLearner, campaignParticipation, withAssessment) => {
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

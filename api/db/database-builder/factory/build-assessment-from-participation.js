import buildAssessment from './build-assessment';
import buildUser from './build-user';
import buildCampaignParticipation from './build-campaign-participation';
import buildOrganizationLearner from './build-organization-learner';

export default function buildAssessmentFromParticipation(campaignParticipation, organizationLearner, user) {
  const userId = buildUser(user).id;
  const organizationLearnerId = buildOrganizationLearner(organizationLearner).id;
  const campaignParticipationId = buildCampaignParticipation({
    ...campaignParticipation,
    userId,
    organizationLearnerId,
  }).id;

  return buildAssessment({ userId, campaignParticipationId });
}

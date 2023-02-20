import buildAssessment from './build-assessment';
import buildCampaignParticipation from './build-campaign-participation';
import buildUser from './build-user';

export default (user, campaignParticipation, withAssessment) => {
  const { id: userId } = buildUser(user);
  const campaignParticipationCreated = buildCampaignParticipation({ userId, ...campaignParticipation });
  if (withAssessment) {
    buildAssessment({ userId, campaignParticipationId: campaignParticipationCreated.id });
  }
  return campaignParticipationCreated;
};

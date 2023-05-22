import { buildAssessment } from './build-assessment.js';
import { buildCampaignParticipation } from './build-campaign-participation.js';
import { buildUser } from './build-user.js';

const buildCampaignParticipationWithUser = (user, campaignParticipation, withAssessment) => {
  const { id: userId } = buildUser(user);
  const campaignParticipationCreated = buildCampaignParticipation({ userId, ...campaignParticipation });
  if (withAssessment) {
    buildAssessment({ userId, campaignParticipationId: campaignParticipationCreated.id });
  }
  return campaignParticipationCreated;
};

export { buildCampaignParticipationWithUser };

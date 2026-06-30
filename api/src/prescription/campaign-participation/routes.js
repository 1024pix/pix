import { adminCampaignParticipationRoute } from './application/admin-campaign-participation-route.js';
import { campaignParticipationRoute } from './application/campaign-participation-route.js';
import { learnerParticipationRoute } from './application/learner-participation-route.js';
import { poleEmploiRoute } from './application/pole-emploi-route.js';

const campaignParticipationsRoutes = [
  adminCampaignParticipationRoute,
  learnerParticipationRoute,
  campaignParticipationRoute,
  poleEmploiRoute,
];

export { campaignParticipationsRoutes };

import * as adminCampaignParticipation from './application/admin-campaign-participation-route.js';
import * as campaignParticipation from './application/campaign-participation-route.js';
import * as learnerParticipations from './application/learner-participation-route.js';
import * as poleEmploiSendings from './application/pole-emploi-route.js';

const campaignParticipationsRoutes = [
  adminCampaignParticipation,
  campaignParticipation,
  learnerParticipations,
  poleEmploiSendings,
];

export { campaignParticipationsRoutes };

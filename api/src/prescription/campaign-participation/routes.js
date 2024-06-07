import * as adminCampaignParticipation from './application/admin-campaign-participation-route.js';
import * as campaignParticipation from './application/campaign-participation-route.js';
import * as learnerParticipations from './application/learner-participation-route.js';

const campaignParticipationsRoutes = [adminCampaignParticipation, learnerParticipations, campaignParticipation];

export { campaignParticipationsRoutes };

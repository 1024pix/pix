import * as campaignParticipation from './application/campaign-participation-route.js';
import * as learnerParticipations from './application/learner-participation-route.js';
import * as poleEmploiSendings from './application/pole-emploi-route.js';

const campaignParticipationsRoutes = [learnerParticipations, campaignParticipation, poleEmploiSendings];

export { campaignParticipationsRoutes };

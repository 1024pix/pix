import { campaignAdministrationRoute } from './application/campaign-administration-route.js';
import { campaignDetailRoute } from './application/campaign-detail-route.js';
import { campaignResultsRoute } from './application/campaign-results-route.js';
import { campaignRoute } from './application/campaign-route.js';
import { campaignStatsRoute } from './application/campaign-stats-route.js';

const campaignRoutes = [
  campaignRoute,
  campaignAdministrationRoute,
  campaignDetailRoute,
  campaignResultsRoute,
  campaignStatsRoute,
];

export { campaignRoutes };

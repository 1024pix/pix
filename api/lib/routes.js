import * as healthcheck from '../src/shared/application/healthcheck/index.js';
import * as campaignParticipations from './application/campaign-participations/index.js';
import * as organizations from './application/organizations/index.js';
import * as scoOrganizationLearners from './application/sco-organization-learners/index.js';
import * as users from './application/users/index.js';

const routes = [campaignParticipations, healthcheck, organizations, scoOrganizationLearners, users];

export { routes };

import * as campaignStatsApi from '../../../prescription/campaign/application/api/campaign-stats-api.js';
import * as campaignApi from '../../../prescription/campaign/application/api/campaigns-api.js';
import * as learnerApi from '../../../prescription/learner-management/application/api/learners-api.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import * as organizationApi from '../../../team/application/api/organization.js';
import { certificationCenterApiRepository } from './certification-center-api.repository.js';
import { organizationForAdminRepository } from './organization-for-admin.repository.js';
const repositoriesWithoutInjectedDependencies = {
  organizationForAdminRepository,
  certificationCenterApiRepository,
};

const dependencies = {
  organizationApi,
  learnerApi,
  campaignApi,
  campaignStatsApi,
};

const repositories = injectDependencies(repositoriesWithoutInjectedDependencies, dependencies);

export { repositories };

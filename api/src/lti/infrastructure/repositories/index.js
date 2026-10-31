import * as campaignsApi from '../../../prescription/campaign/application/api/campaigns-api.js';
import * as combinedCourseApi from '../../../quest/application/api/combined-course-api.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import boundedContext from '../../dependencies.json' with { type: 'json' };
import { ltiCampaignRepository } from './lti-campaign.repository.js';

const repositoriesWithoutInjectedDependencies = {
  ltiCampaignRepository,
};

const dependencies = {
  campaignsApi,
  combinedCourseApi,
};

const repositories = injectDependencies(repositoriesWithoutInjectedDependencies, dependencies, boundedContext);

export { repositories };

import * as authenticationMethodRepository from '../../../identity-access-management/infrastructure/repositories/authentication-method.repository.js';
import * as campaignsAPI from '../../../prescription/campaign/application/api/campaigns-api.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import boundedContext from '../../dependencies.json' with { type: 'json' };
import * as campaignRepository from '../../infrastructure/repositories/campaign-repository.js';
import * as clientApplicationRepository from '../../infrastructure/repositories/client-application-repository.js';
import * as oidcProviderRepository from '../../infrastructure/repositories/oidc-provider-repository.js';
import * as organizationRepository from '../../infrastructure/repositories/organization-repository.js';
import { extractTransformAndLoadData } from './extract-transform-and-load-data.js';
import { findCampaigns } from './find-campaigns.js';
import { findOrganizationIdsByClientApplication } from './find-organization-ids-by-client-application.js';
import { findOrganizations } from './find-organizations.js';
import { getCampaignOrganizationId } from './get-campaign-organization-id.js';
import { getCampaignParticipations } from './get-campaign-participations.js';

const dependencies = {
  campaignsAPI,
  authenticationMethodRepository,
  clientApplicationRepository,
  organizationRepository,
  campaignRepository,
  oidcProviderRepository,
};

const usecasesWithoutInjectedDependencies = {
  extractTransformAndLoadData,
  findCampaigns,
  findOrganizationIdsByClientApplication,
  findOrganizations,
  getCampaignOrganizationId,
  getCampaignParticipations,
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies, boundedContext);

export { usecases };

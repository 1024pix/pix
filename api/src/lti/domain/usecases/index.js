import { cryptoService } from '../../../shared/domain/services/crypto-service.js';
import * as urlService from '../../../shared/domain/services/url-service.js';
import { httpAgent } from '../../../shared/infrastructure/http-agent.js';
import * as organizationRepository from '../../../shared/infrastructure/repositories/organization-repository.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import boundedContext from '../../dependencies.json' with { type: 'json' };
import { repositories as injectedLtiRepositories } from '../../infrastructure/repositories/index.js';
import { ltiPlatformRepository } from '../../infrastructure/repositories/lti-platform.repository.js';
import { ltiPlatformRegistrationRepository } from '../../infrastructure/repositories/lti-platform-registration.repository.js';
import { ltiService } from '../services/lti.service.js';
import { authenticateDeepLinking } from './authenticate-deep-linking.usecase.js';
import { getLtiCampaign } from './get-lti-campaign.usecase.js';
import { getLtiCampaignsByOrganizations } from './get-lti-campaigns-by-organizations.usecase.js';
import { listLtiPublicKeys } from './list-lti-public-keys.usecase.js';
import { registerLtiPlatform } from './register-lti-platform.usecase.js';

const utils = {
  httpAgent,
};

const services = { cryptoService, ltiService, urlService };

const repositories = {
  ltiPlatformRegistrationRepository,
  ltiPlatformRepository,
  organizationRepository,
  ltiCampaignRepository: injectedLtiRepositories.ltiCampaignRepository,
};

const usecasesWithoutInjectedDependencies = {
  authenticateDeepLinking,
  listLtiPublicKeys,
  registerLtiPlatform,
  getLtiCampaign,
  getLtiCampaignsByOrganizations,
};

const dependencies = Object.assign({}, repositories, services, utils);

export const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies, boundedContext);

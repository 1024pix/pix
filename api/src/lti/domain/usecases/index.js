import { cryptoService } from '../../../shared/domain/services/crypto-service.js';
import * as urlService from '../../../shared/domain/services/url-service.js';
import { httpAgent } from '../../../shared/infrastructure/http-agent.js';
import { getI18n } from '../../../shared/infrastructure/i18n/i18n.js';
import * as organizationRepository from '../../../shared/infrastructure/repositories/organization-repository.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import boundedContext from '../../dependencies.json' with { type: 'json' };
import { repositories as injectedLtiRepositories } from '../../infrastructure/repositories/index.js';
import { ltiCampaignParticipationRepository } from '../../infrastructure/repositories/lti-campaign-participation.repository.js';
import { ltiPlatformRepository } from '../../infrastructure/repositories/lti-platform.repository.js';
import { ltiPlatformRegistrationRepository } from '../../infrastructure/repositories/lti-platform-registration.repository.js';
import { ltiScoringService } from '../services/lti.scoring.service.js';
import { ltiService } from '../services/lti.service.js';
import { authenticateDeepLinking } from './authenticate-deep-linking.usecase.js';
import { getLtiCampaign } from './get-lti-campaign.usecase.js';
import { getLtiCampaignsByOrganizations } from './get-lti-campaigns-by-organizations.usecase.js';
import { listLtiPublicKeys } from './list-lti-public-keys.usecase.js';
import { registerLtiPlatform } from './register-lti-platform.usecase.js';
import { startLtiCampaign } from './start-lti-campaign.usecase.js';

const utils = {
  getI18n,
  httpAgent,
};

const services = { cryptoService, ltiScoringService, ltiService, urlService };

const repositories = {
  ltiPlatformRegistrationRepository,
  ltiPlatformRepository,
  organizationRepository,
  ltiCampaignRepository: injectedLtiRepositories.ltiCampaignRepository,
  ltiCampaignParticipationRepository,
};

const usecasesWithoutInjectedDependencies = {
  authenticateDeepLinking,
  listLtiPublicKeys,
  registerLtiPlatform,
  getLtiCampaign,
  getLtiCampaignsByOrganizations,
  startLtiCampaign,
};

const dependencies = Object.assign({}, repositories, services, utils);

export const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies, boundedContext);

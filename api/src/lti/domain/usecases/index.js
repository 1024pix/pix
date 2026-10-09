import { cryptoService } from '../../../shared/domain/services/crypto-service.js';
import * as urlService  from '../../../shared/domain/services/url-service.js';
import { httpAgent } from '../../../shared/infrastructure/http-agent.js';
import * as organizationRepository from '../../../shared/infrastructure/repositories/organization-repository.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import boundedContext from '../../dependencies.json' with { type: 'json' };
import { ltiPlatformRegistrationRepository } from '../../infrastructure/repositories/lti-platform-registration.repository.js';
import { listLtiPublicKeys } from './list-lti-public-keys.usecase.js';
import { registerLtiPlatform } from './register-lti-platform.usecase.js';

const utils = {
  httpAgent,
};

const services = { cryptoService, urlService };

const repositories = {
  ltiPlatformRegistrationRepository,
  organizationRepository,
};

const usecasesWithoutInjectedDependencies = {
  listLtiPublicKeys,
  registerLtiPlatform,
};

const dependencies = Object.assign({}, repositories, services, utils);

export const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies, boundedContext);

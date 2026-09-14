import { featureToggles } from '../../../../shared/infrastructure/feature-toggles/index.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import boundedContext from '../../../dependencies.json' with { type: 'json' };
import * as campaignParticipationsApiRepository from '../../../infrastructure/repositories/campaign-participations-api.repository.js';
import * as candidatesApiRepository from '../../../infrastructure/repositories/candidates-api.repository.js';
import * as learnersApiRepository from '../../../infrastructure/repositories/learners-api.repository.js';
import * as userTeamsApiRepository from '../../../infrastructure/repositories/user-teams-api.repository.js';
import { canSelfAnonymize } from './can-self-anonymize.service.js';

const repositories = {
  campaignParticipationsApiRepository,
  candidatesApiRepository,
  learnersApiRepository,
  userTeamsApiRepository,
};

const services = {
  featureToggles,
};

const servicesWithoutInjectedDependencies = {
  canSelfAnonymize,
};

const dependencies = Object.assign({}, repositories, services);

export const anonymizeServices = injectDependencies(servicesWithoutInjectedDependencies, dependencies, boundedContext);

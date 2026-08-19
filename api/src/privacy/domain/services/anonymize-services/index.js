import { lastUserApplicationConnectionsRepository } from '../../../../identity-access-management/infrastructure/repositories/last-user-application-connections.repository.js';
import { resetPasswordDemandRepository } from '../../../../identity-access-management/infrastructure/repositories/reset-password-demand.repository.js';
import * as userRepository from '../../../../identity-access-management/infrastructure/repositories/user.repository.js';
import * as userLoginRepository from '../../../../identity-access-management/infrastructure/repositories/user-login-repository.js';
import { featureToggles } from '../../../../shared/infrastructure/feature-toggles/index.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import { certificationCenterMembershipRepository } from '../../../../team/infrastructure/repositories/certification-center-membership.repository.js';
import boundedContext from '../../../dependencies.json' with { type: 'json' };
import * as campaignParticipationsApiRepository from '../../../infrastructure/repositories/campaign-participations-api.repository.js';
import * as candidatesApiRepository from '../../../infrastructure/repositories/candidates-api.repository.js';
import * as learnersApiRepository from '../../../infrastructure/repositories/learners-api.repository.js';
import * as userTeamsApiRepository from '../../../infrastructure/repositories/user-teams-api.repository.js';
import { anonymizeUser } from './anonymize-user.service.js';
import { canSelfAnonymize } from './can-self-anonymize.service.js';

const repositories = {
  campaignParticipationsApiRepository,
  candidatesApiRepository,
  certificationCenterMembershipRepository,
  lastUserApplicationConnectionsRepository,
  learnersApiRepository,
  resetPasswordDemandRepository,
  userLoginRepository,
  userRepository,
  userTeamsApiRepository,
};

const services = {
  featureToggles,
};

const servicesWithoutInjectedDependencies = {
  anonymizeUser,
  canSelfAnonymize,
};

const dependencies = Object.assign({}, repositories, services);

export const anonymizeServices = injectDependencies(servicesWithoutInjectedDependencies, dependencies, boundedContext);

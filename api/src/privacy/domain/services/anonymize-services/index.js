import * as authenticationMethodRepository from '../../../../identity-access-management/infrastructure/repositories/authentication-method.repository.js';
import { lastUserApplicationConnectionsRepository } from '../../../../identity-access-management/infrastructure/repositories/last-user-application-connections.repository.js';
import { refreshTokenRepository } from '../../../../identity-access-management/infrastructure/repositories/refresh-token.repository.js';
import { resetPasswordDemandRepository } from '../../../../identity-access-management/infrastructure/repositories/reset-password-demand.repository.js';
import * as userRepository from '../../../../identity-access-management/infrastructure/repositories/user.repository.js';
import * as userLoginRepository from '../../../../identity-access-management/infrastructure/repositories/user-login-repository.js';
import * as userAcceptanceRepository from '../../../../legal-documents/infrastructure/repositories/user-acceptance.repository.js';
import { featureToggles } from '../../../../shared/infrastructure/feature-toggles/index.js';
import { auditLoggingJobRepository } from '../../../../shared/infrastructure/repositories/jobs/audit-logging-job.repository.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import { certificationCenterMembershipRepository } from '../../../../team/infrastructure/repositories/certification-center-membership.repository.js';
import * as membershipRepository from '../../../../team/infrastructure/repositories/membership.repository.js';
import boundedContext from '../../../dependencies.json' with { type: 'json' };
import * as campaignParticipationsApiRepository from '../../../infrastructure/repositories/campaign-participations-api.repository.js';
import * as candidatesApiRepository from '../../../infrastructure/repositories/candidates-api.repository.js';
import * as learnersApiRepository from '../../../infrastructure/repositories/learners-api.repository.js';
import * as userTeamsApiRepository from '../../../infrastructure/repositories/user-teams-api.repository.js';
import { anonymizeUser } from './anonymize-user.service.js';
import { canAnonymizeItself } from './can-anonymize-itself.service.js';

const repositories = {
  authenticationMethodRepository,
  campaignParticipationsApiRepository,
  candidatesApiRepository,
  certificationCenterMembershipRepository,
  auditLoggingJobRepository,
  learnersApiRepository,
  membershipRepository,
  lastUserApplicationConnectionsRepository,
  refreshTokenRepository,
  resetPasswordDemandRepository,
  userAcceptanceRepository,
  userLoginRepository,
  userRepository,
  userTeamsApiRepository,
};

const services = {
  featureToggles,
};

const servicesWithoutInjectedDependencies = {
  anonymizeUser,
  canAnonymizeItself,
};

const dependencies = Object.assign({}, repositories, services);

export const anonymizeServices = injectDependencies(servicesWithoutInjectedDependencies, dependencies, boundedContext);

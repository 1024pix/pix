import * as authenticationMethodRepository from '../../../identity-access-management/infrastructure/repositories/authentication-method.repository.js';
import { lastUserApplicationConnectionsRepository } from '../../../identity-access-management/infrastructure/repositories/last-user-application-connections.repository.js';
import { refreshTokenRepository } from '../../../identity-access-management/infrastructure/repositories/refresh-token.repository.js';
import { resetPasswordDemandRepository } from '../../../identity-access-management/infrastructure/repositories/reset-password-demand.repository.js';
import * as userRepository from '../../../identity-access-management/infrastructure/repositories/user.repository.js';
import * as userLoginRepository from '../../../identity-access-management/infrastructure/repositories/user-login-repository.js';
import * as userAcceptanceRepository from '../../../legal-documents/infrastructure/repositories/user-acceptance.repository.js';
import * as organizationLearnerRepository from '../../../prescription/organization-learner/infrastructure/repositories/organization-learner-repository.js';
import { featureToggles as featureTogglesService } from '../../../shared/infrastructure/feature-toggles/index.js';
import { auditLoggingJobRepository } from '../../../shared/infrastructure/repositories/jobs/audit-logging-job.repository.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import { certificationCenterMembershipRepository } from '../../../team/infrastructure/repositories/certification-center-membership.repository.js';
import * as membershipRepository from '../../../team/infrastructure/repositories/membership.repository.js';
import * as campaignParticipationsApiRepository from '../../infrastructure/repositories/campaign-participations-api.repository.js';
import * as candidatesApiRepository from '../../infrastructure/repositories/candidates-api.repository.js';
import * as learnersApiRepository from '../../infrastructure/repositories/learners-api.repository.js';
import * as userTeamsApiRepository from '../../infrastructure/repositories/user-teams-api.repository.js';

const repositories = {
  authenticationMethodRepository,
  campaignParticipationsApiRepository,
  candidatesApiRepository,
  certificationCenterMembershipRepository,
  auditLoggingJobRepository,
  learnersApiRepository,
  membershipRepository,
  lastUserApplicationConnectionsRepository,
  organizationLearnerRepository,
  refreshTokenRepository,
  resetPasswordDemandRepository,
  userAcceptanceRepository,
  userLoginRepository,
  userRepository,
  userTeamsApiRepository,
};

const services = {
  featureTogglesService,
};

import { anonymizeUser } from './anonymize-user.usecase.js';
import { canSelfDeleteAccount } from './can-self-delete-account.usecase.js';

const usecasesWithoutInjectedDependencies = {
  anonymizeUser,
  canSelfDeleteAccount,
};

const dependencies = Object.assign({}, repositories, services);

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };

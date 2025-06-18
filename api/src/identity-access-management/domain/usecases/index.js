import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { oidcAuthenticationServiceRegistry } from '../../../../lib/domain/usecases/index.js';
import * as centerRepository from '../../../certification/enrolment/infrastructure/repositories/center-repository.js';
import * as userRecommendedTrainingRepository from '../../../devcomp/infrastructure/repositories/user-recommended-training-repository.js';
import * as campaignRepository from '../../../prescription/campaign/infrastructure/repositories/campaign-repository.js';
import { repositories as campaignRepositories } from '../../../prescription/campaign/infrastructure/repositories/index.js';
import * as campaignParticipationRepository from '../../../prescription/campaign-participation/infrastructure/repositories/campaign-participation-repository.js';
import * as prescriptionOrganizationLearnerRepository from '../../../prescription/learner-management/infrastructure/repositories/organization-learner-repository.js';
import { config } from '../../../shared/config.js';
import { eventBus } from '../../../shared/domain/events/index.js';
import { cryptoService } from '../../../shared/domain/services/crypto-service.js';
import { mailService } from '../../../shared/domain/services/mail-service.js';
import * as obfuscationService from '../../../shared/domain/services/obfuscation-service.js';
import { tokenService } from '../../../shared/domain/services/token-service.js';
import * as userReconciliationService from '../../../shared/domain/services/user-reconciliation-service.js';
import * as userService from '../../../shared/domain/services/user-service.js';
import * as passwordValidator from '../../../shared/domain/validators/password-validator.js';
import * as userValidator from '../../../shared/domain/validators/user-validator.js';
import { httpAgent } from '../../../shared/infrastructure/http-agent.js';
import { adminMemberRepository } from '../../../shared/infrastructure/repositories/admin-member.repository.js';
import * as organizationLearnerRepository from '../../../shared/infrastructure/repositories/organization-learner-repository.js';
import * as organizationRepository from '../../../shared/infrastructure/repositories/organization-repository.js';
import * as userLoginRepository from '../../../shared/infrastructure/repositories/user-login-repository.js';
import * as codeUtils from '../../../shared/infrastructure/utils/code-utils.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import * as emailRepository from '../../../shared/mail/infrastructure/repositories/email.repository.js';
import { certificationCenterMembershipRepository } from '../../../team/infrastructure/repositories/certification-center-membership.repository.js';
import * as membershipRepository from '../../../team/infrastructure/repositories/membership.repository.js';
import { accountRecoveryDemandRepository } from '../../infrastructure/repositories/account-recovery-demand.repository.js';
import { anonymousUserTokenRepository } from '../../infrastructure/repositories/anonymous-user-token.repository.js';
import * as authenticationMethodRepository from '../../infrastructure/repositories/authentication-method.repository.js';
import * as certificationPointOfContactRepository from '../../infrastructure/repositories/certification-point-of-contact.repository.js';
import { clientApplicationRepository } from '../../infrastructure/repositories/client-application.repository.js';
import { emailValidationDemandRepository } from '../../infrastructure/repositories/email-validation-demand.repository.js';
import { eventLoggingJobRepository } from '../../infrastructure/repositories/jobs/event-logging-job.repository.js';
import { garAnonymizedBatchEventsLoggingJobRepository } from '../../infrastructure/repositories/jobs/gar-anonymized-batch-events-logging-job-repository.js';
import { userAnonymizedEventLoggingJobRepository } from '../../infrastructure/repositories/jobs/user-anonymized-event-logging-job-repository.js';
import { lastUserApplicationConnectionsRepository } from '../../infrastructure/repositories/last-user-application-connections.repository.js';
import { legalDocumentApiRepository } from '../../infrastructure/repositories/legal-document-api.repository.js';
import { ltiPlatformRegistrationRepository } from '../../infrastructure/repositories/lti-platform-registration.repository.js';
import { oidcProviderRepository } from '../../infrastructure/repositories/oidc-provider-repository.js';
import * as privacyUsersApiRepository from '../../infrastructure/repositories/privacy-users-api.repository.js';
import { refreshTokenRepository } from '../../infrastructure/repositories/refresh-token.repository.js';
import { resetPasswordDemandRepository } from '../../infrastructure/repositories/reset-password-demand.repository.js';
import { revokedUserAccessRepository } from '../../infrastructure/repositories/revoked-user-access.repository.js';
import * as userRepository from '../../infrastructure/repositories/user.repository.js';
import { userEmailRepository } from '../../infrastructure/repositories/user-email.repository.js';
import { userToCreateRepository } from '../../infrastructure/repositories/user-to-create.repository.js';
import { authenticationSessionService } from '../services/authentication-session.service.js';
import * as passwordGeneratorService from '../services/password-generator.service.js';
import { pixAuthenticationService } from '../services/pix-authentication-service.js';
import { resetPasswordService } from '../services/reset-password.service.js';
import { scoAccountRecoveryService } from '../services/sco-account-recovery.service.js';
import { addOidcProviderValidator } from '../validators/add-oidc-provider.validator.js';

const path = dirname(fileURLToPath(import.meta.url));

const repositories = {
  accountRecoveryDemandRepository,
  adminMemberRepository,
  anonymousUserTokenRepository,
  authenticationMethodRepository,
  campaignParticipationRepository,
  campaignRepository,
  campaignToJoinRepository: campaignRepositories.campaignToJoinRepository,
  centerRepository,
  certificationCenterMembershipRepository,
  certificationPointOfContactRepository,
  emailValidationDemandRepository,
  clientApplicationRepository,
  emailRepository,
  eventLoggingJobRepository,
  lastUserApplicationConnectionsRepository,
  legalDocumentApiRepository,
  ltiPlatformRegistrationRepository,
  membershipRepository,
  oidcProviderRepository,
  organizationLearnerRepository,
  organizationRepository,
  prescriptionOrganizationLearnerRepository,
  privacyUsersApiRepository,
  refreshTokenRepository,
  resetPasswordDemandRepository,
  revokedUserAccessRepository,
  userAnonymizedEventLoggingJobRepository,
  userEmailRepository,
  userLoginRepository,
  userRecommendedTrainingRepository,
  userRepository,
  userToCreateRepository,
  garAnonymizedBatchEventsLoggingJobRepository,
};
const services = {
  authenticationSessionService,
  cryptoService,
  mailService,
  obfuscationService,
  oidcAuthenticationServiceRegistry,
  passwordGeneratorService,
  pixAuthenticationService,
  resetPasswordService,
  scoAccountRecoveryService,
  tokenService,
  userReconciliationService,
  userService,
};
const validators = {
  addOidcProviderValidator,
  passwordValidator,
  userValidator,
};
const utils = {
  httpAgent,
};

const dependencies = Object.assign({ config, codeUtils }, eventBus, repositories, services, validators, utils);

const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({ path: join(path, './'), ignoredFileNames: ['index.js'] })),
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { eventBus } from '../../../../lib/domain/events/index.js';
import { mailService } from '../../../../lib/domain/services/mail-service.js';
import * as userReconciliationService from '../../../../lib/domain/services/user-reconciliation-service.js';
import { oidcAuthenticationServiceRegistry } from '../../../../lib/domain/usecases/index.js';
import * as campaignParticipationRepository from '../../../../lib/infrastructure/repositories/campaign-participation-repository.js';
import * as campaignRepository from '../../../../lib/infrastructure/repositories/campaign-repository.js';
import * as organizationLearnerRepository from '../../../../lib/infrastructure/repositories/organization-learner-repository.js';
import * as userRecommendedTrainingRepository from '../../../devcomp/infrastructure/repositories/user-recommended-training-repository.js';
import { repositories as campaignRepositories } from '../../../prescription/campaign/infrastructure/repositories/index.js';
import { config } from '../../../shared/config.js';
import { cryptoService } from '../../../shared/domain/services/crypto-service.js';
import { tokenService } from '../../../shared/domain/services/token-service.js';
import * as userService from '../../../shared/domain/services/user-service.js';
import * as passwordValidator from '../../../shared/domain/validators/password-validator.js';
import * as userValidator from '../../../shared/domain/validators/user-validator.js';
import { adminMemberRepository } from '../../../shared/infrastructure/repositories/admin-member.repository.js';
import * as userLoginRepository from '../../../shared/infrastructure/repositories/user-login-repository.js';
import * as codeUtils from '../../../shared/infrastructure/utils/code-utils.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import { accountRecoveryDemandRepository } from '../../infrastructure/repositories/account-recovery-demand.repository.js';
import * as authenticationMethodRepository from '../../infrastructure/repositories/authentication-method.repository.js';
import { emailValidationDemandRepository } from '../../infrastructure/repositories/email-validation-demand.repository.js';
import { eventLoggingJobRepository } from '../../infrastructure/repositories/jobs/event-logging-job.repository.js';
import { garAnonymizedBatchEventsLoggingJobRepository } from '../../infrastructure/repositories/jobs/gar-anonymized-batch-events-logging-job-repository.js';
import { oidcProviderRepository } from '../../infrastructure/repositories/oidc-provider-repository.js';
import { refreshTokenRepository } from '../../infrastructure/repositories/refresh-token.repository.js';
import { resetPasswordDemandRepository } from '../../infrastructure/repositories/reset-password-demand.repository.js';
import * as userRepository from '../../infrastructure/repositories/user.repository.js';
import { userEmailRepository } from '../../infrastructure/repositories/user-email.repository.js';
import { userToCreateRepository } from '../../infrastructure/repositories/user-to-create.repository.js';
import { authenticationSessionService } from '../services/authentication-session.service.js';
import { pixAuthenticationService } from '../services/pix-authentication-service.js';
import { resetPasswordService } from '../services/reset-password.service.js';
import { scoAccountRecoveryService } from '../services/sco-account-recovery.service.js';
import { addOidcProviderValidator } from '../validators/add-oidc-provider.validator.js';

const path = dirname(fileURLToPath(import.meta.url));

const repositories = {
  accountRecoveryDemandRepository,
  adminMemberRepository,
  authenticationMethodRepository,
  campaignParticipationRepository,
  campaignRepository,
  campaignToJoinRepository: campaignRepositories.campaignToJoinRepository,
  emailValidationDemandRepository,
  eventLoggingJobRepository,
  oidcProviderRepository,
  organizationLearnerRepository,
  refreshTokenRepository,
  resetPasswordDemandRepository,
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
  oidcAuthenticationServiceRegistry,
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

const dependencies = Object.assign({ config, codeUtils }, eventBus, repositories, services, validators);

const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({ path: join(path, './'), ignoredFileNames: ['index.js'] })),
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };

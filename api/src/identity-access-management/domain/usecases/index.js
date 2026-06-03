// eslint-disable-next-line simple-import-sort/imports -- import userRepository first to avoid circular dependency ("Cannot access 'campaignRepositories' before initialization")
import * as userRepository from '../../infrastructure/repositories/user.repository.js';

import * as centerRepository from '../../../certification/enrolment/infrastructure/repositories/center-repository.js';
import * as userRecommendedTrainingRepository from '../../../devcomp/infrastructure/repositories/user-recommended-training-repository.js';
import * as campaignRepository from '../../../prescription/campaign/infrastructure/repositories/campaign-repository.js';
import { repositories as campaignRepositories } from '../../../prescription/campaign/infrastructure/repositories/index.js';
import * as campaignParticipationRepository from '../../../prescription/campaign-participation/infrastructure/repositories/campaign-participation-repository.js';
import * as prescriptionOrganizationLearnerRepository from '../../../prescription/learner-management/infrastructure/repositories/organization-learner-repository.js';
import * as organizationLearnerRepository from '../../../prescription/organization-learner/infrastructure/repositories/organization-learner-repository.js';
import { config } from '../../../shared/config.js';
import { cryptoService } from '../../../shared/domain/services/crypto-service.js';
import { mailService } from '../../../shared/domain/services/mail-service.js';
import * as obfuscationService from '../../../shared/domain/services/obfuscation-service.js';
import { tokenService } from '../../../shared/domain/services/token-service.js';
import * as userReconciliationService from '../../../shared/domain/services/user-reconciliation-service.js';
import * as userService from '../services/user-service.js';
import * as passwordValidator from '../../../shared/domain/validators/password-validator.js';
import * as userValidator from '../../../shared/domain/validators/user-validator.js';
import { httpAgent } from '../../../shared/infrastructure/http-agent.js';
import { adminMemberRepository } from '../../../shared/infrastructure/repositories/admin-member.repository.js';
import { auditLoggingJobRepository } from '../../../shared/infrastructure/repositories/jobs/audit-logging-job.repository.js';
import * as organizationRepository from '../../../shared/infrastructure/repositories/organization-repository.js';
import * as userLoginRepository from '../../infrastructure/repositories/user-login-repository.js';
import * as codeUtils from '../../../shared/infrastructure/utils/code-utils.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import * as emailRepository from '../../../shared/mail/infrastructure/repositories/email.repository.js';
import { certificationCenterMembershipRepository } from '../../../team/infrastructure/repositories/certification-center-membership.repository.js';
import * as membershipRepository from '../../../team/infrastructure/repositories/membership.repository.js';
import { accountRecoveryDemandRepository } from '../../infrastructure/repositories/account-recovery-demand.repository.js';
import { anonymousUserTokenRepository } from '../../infrastructure/repositories/anonymous-user-token.repository.js';
import * as authenticationMethodRepository from '../../infrastructure/repositories/authentication-method.repository.js';
import * as certificationPointOfContactRepository from '../../infrastructure/repositories/certification-point-of-contact.repository.js';
import { clientApplicationRepository } from '../../infrastructure/repositories/client-application.repository.js';
import { emailValidationDemandRepository } from '../../infrastructure/repositories/email-validation-demand.repository.js';
import { lastUserApplicationConnectionsRepository } from '../../infrastructure/repositories/last-user-application-connections.repository.js';
import { legalDocumentApiRepository } from '../../infrastructure/repositories/legal-document-api.repository.js';
import { ltiPlatformRegistrationRepository } from '../../infrastructure/repositories/lti-platform-registration.repository.js';
import { oidcProviderRepository } from '../../infrastructure/repositories/oidc-provider-repository.js';
import * as privacyUsersApiRepository from '../../infrastructure/repositories/privacy-users-api.repository.js';
import { refreshTokenRepository } from '../../infrastructure/repositories/refresh-token.repository.js';
import { resetPasswordDemandRepository } from '../../infrastructure/repositories/reset-password-demand.repository.js';
import { revokedUserAccessRepository } from '../../infrastructure/repositories/revoked-user-access.repository.js';
import { userEmailRepository } from '../../infrastructure/repositories/user-email.repository.js';
import { userToCreateRepository } from '../../infrastructure/repositories/user-to-create.repository.js';
import { authenticationSessionService } from '../services/authentication-session.service.js';
import { OidcAuthenticationServiceRegistry } from '../services/oidc-authentication-service-registry.js';
import * as passwordGeneratorService from '../services/password-generator.service.js';
import { pixAuthenticationService } from '../services/pix-authentication-service.js';
import { resetPasswordService } from '../services/reset-password.service.js';
import { scoAccountRecoveryService } from '../services/sco-account-recovery.service.js';
import { addOidcProviderValidator } from '../validators/add-oidc-provider.validator.js';

const oidcAuthenticationServiceRegistry = new OidcAuthenticationServiceRegistry({ oidcProviderRepository });

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
  auditLoggingJobRepository,
  lastUserApplicationConnectionsRepository,
  legalDocumentApiRepository,
  ltiPlatformRegistrationRepository,
  membershipRepository,
  oidcAuthenticationServiceRegistry,
  oidcProviderRepository,
  organizationLearnerRepository,
  organizationRepository,
  prescriptionOrganizationLearnerRepository,
  privacyUsersApiRepository,
  refreshTokenRepository,
  resetPasswordDemandRepository,
  revokedUserAccessRepository,
  userEmailRepository,
  userLoginRepository,
  userRecommendedTrainingRepository,
  userRepository,
  userToCreateRepository,
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

const dependencies = Object.assign({ config, codeUtils }, repositories, services, validators, utils);

import { acceptPixCertifTermsOfService } from './accept-pix-certif-terms-of-service.usecase.js';
import { acceptPixLastTermsOfService } from './accept-pix-last-terms-of-service.usecase.js';
import { acceptPixOrgaTermsOfService } from './accept-pix-orga-terms-of-service.usecase.js';
import { addOidcProvider } from './add-oidc-provider.js';
import { addPixAuthenticationMethod } from './add-pix-authentication-method.usecase.js';
import { addUserEmailWithValidation } from './add-user-email-with-validation.usecase.js';
import { anonymizeGarAuthenticationMethods } from './anonymize-gar-authentication-methods.usecase.js';
import { anonymizeUser } from './anonymize-user.usecase.js';
import { assertUserIsBlocked } from './assert-user-is-blocked.js';
import { authenticateAnonymousUser } from './authenticate-anonymous-user.usecase.js';
import { authenticateApplication } from './authenticate-application.js';
import { authenticateForSaml } from './authenticate-for-saml.usecase.js';
import { authenticateOidcUser } from './authenticate-oidc-user.usecase.js';
import { authenticateUser } from './authenticate-user.usecase.js';
import { changeUserLocale } from './change-user-locale.usecase.js';
import { checkScoAccountRecovery } from './check-sco-account-recovery.usecase.js';
import { createAccessTokenFromRefreshToken } from './create-access-token-from-refresh-token.usecase.js';
import { createOidcUser } from './create-oidc-user.usecase.js';
import { createResetPasswordDemand } from './create-reset-password-demand.usecase.js';
import { createUser } from './create-user.usecase.js';
import { findPaginatedFilteredUsers } from './find-paginated-filtered-users.usecase.js';
import { findUserAuthenticationMethods } from './find-user-authentication-methods.usecase.js';
import { findUserForOidcReconciliation } from './find-user-for-oidc-reconciliation.usecase.js';
import { getAccountRecoveryDetails } from './get-account-recovery-details.usecase.js';
import { getActiveByUserIds } from './get-active-by-user-ids.usecase.js';
import { getAllIdentityProviders } from './get-all-identity-providers.usecase.js';
import { getAuthorizationUrl } from './get-authorization-url.usecase.js';
import { getCertificationPointOfContact } from './get-certification-point-of-contact.usecase.js';
import { getCurrentUser } from './get-current-user.usecase.js';
import { getIdentityProvidersByRequestedApplication } from './get-identity-providers-by-requested-application.usecase.js';
import { getRedirectLogoutUrl } from './get-redirect-logout-url.usecase.js';
import { getSamlAuthenticationRedirectionUrl } from './get-saml-authentication-redirection-url.js';
import { getUserAccountInfo } from './get-user-account-info.usecase.js';
import { getUserByResetPasswordDemand } from './get-user-by-reset-password-demand.usecase.js';
import { getUserDetailsForAdmin } from './get-user-details-for-admin.usecase.js';
import { importUserLastLoggedAt } from './import-user-last-logged-at.usecase.js';
import { listLtiPublicKeys } from './list-lti-public-keys.usecase.js';
import { logoutOidcUser } from './logout-oidc-user.usecase.js';
import { markAssessmentInstructionsInfoAsSeen } from './mark-assessment-instructions-info-as-seen.usecase.js';
import { markUserHasSeenNewDashboardInfo } from './mark-user-has-seen-new-dashboard-info.usecase.js';
import { reassignAuthenticationMethodToAnotherUser } from './reassign-authentication-method-to-another-user.usecase.js';
import { reconcileOidcUser } from './reconcile-oidc-user.usecase.js';
import { reconcileOidcUserForAdmin } from './reconcile-oidc-user-for-admin.usecase.js';
import { registerLtiPlatform } from './register-lti-platform.js';
import { rememberUserHasSeenChallengeTooltip } from './remember-user-has-seen-challenge-tooltip.usecase.js';
import { rememberUserHasSeenLastDataProtectionPolicyInformation } from './remember-user-has-seen-last-data-protection-policy-information.usecase.js';
import { removeAuthenticationMethod } from './remove-authentication-method.usecase.js';
import { revokeAccessForUsers } from './revoke-access-for-users.usecase.js';
import { revokeRefreshToken } from './revoke-refresh-token.usecase.js';
import { selfDeleteUserAccount } from './self-delete-user-account.usecase.js';
import { sendEmailForAccountRecovery } from './send-email-for-account-recovery.usecase.js';
import { sendVerificationCode } from './send-verification-code.usecase.js';
import { unblockUserAccount } from './unblock-user-account.js';
import { updateExpiredPassword } from './update-expired-password.usecase.js';
import { updateUserDetailsByAdmin } from './update-user-details-by-admin.usecase.js';
import { updateUserEmailWithValidation } from './update-user-email-with-validation.usecase.js';
import { updateUserForAccountRecovery } from './update-user-for-account-recovery.usecase.js';
import { updateUserPassword } from './update-user-password.usecase.js';
import { upgradeToRealUser } from './upgrade-to-real-user.usecase.js';
import { validateUserAccountEmail } from './validate-user-account-email.usecase.js';

const usecasesWithoutInjectedDependencies = {
  acceptPixCertifTermsOfService,
  acceptPixLastTermsOfService,
  acceptPixOrgaTermsOfService,
  addOidcProvider,
  addPixAuthenticationMethod,
  anonymizeGarAuthenticationMethods,
  anonymizeUser,
  assertUserIsBlocked,
  authenticateAnonymousUser,
  authenticateApplication,
  authenticateForSaml,
  authenticateOidcUser,
  authenticateUser,
  changeUserLocale,
  checkScoAccountRecovery,
  createAccessTokenFromRefreshToken,
  createOidcUser,
  createResetPasswordDemand,
  createUser,
  findPaginatedFilteredUsers,
  findUserAuthenticationMethods,
  findUserForOidcReconciliation,
  getAccountRecoveryDetails,
  getActiveByUserIds,
  getAllIdentityProviders,
  getAuthorizationUrl,
  getCertificationPointOfContact,
  getCurrentUser,
  getIdentityProvidersByRequestedApplication,
  getRedirectLogoutUrl,
  getSamlAuthenticationRedirectionUrl,
  getUserAccountInfo,
  getUserByResetPasswordDemand,
  getUserDetailsForAdmin,
  importUserLastLoggedAt,
  listLtiPublicKeys,
  logoutOidcUser,
  markAssessmentInstructionsInfoAsSeen,
  markUserHasSeenNewDashboardInfo,
  reassignAuthenticationMethodToAnotherUser,
  reconcileOidcUserForAdmin,
  reconcileOidcUser,
  registerLtiPlatform,
  rememberUserHasSeenChallengeTooltip,
  rememberUserHasSeenLastDataProtectionPolicyInformation,
  removeAuthenticationMethod,
  revokeAccessForUsers,
  revokeRefreshToken,
  selfDeleteUserAccount,
  sendEmailForAccountRecovery,
  sendVerificationCode,
  unblockUserAccount,
  updateExpiredPassword,
  updateUserDetailsByAdmin,
  updateUserEmailWithValidation,
  addUserEmailWithValidation,
  updateUserForAccountRecovery,
  updateUserPassword,
  upgradeToRealUser,
  validateUserAccountEmail,
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { oidcAuthenticationServiceRegistry, usecases };

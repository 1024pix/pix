import { acceptPixCertifTermsOfService } from './accept-pix-certif-terms-of-service.usecase.js';
import { acceptPixLastTermsOfService } from './accept-pix-last-terms-of-service.usecase.js';
import { acceptPixOrgaTermsOfService } from './accept-pix-orga-terms-of-service.usecase.js';
import { addOidcProvider } from './add-oidc-provider.js';
import { addPixAuthenticationMethod } from './add-pix-authentication-method.usecase.js';
import { anonymizeGarAuthenticationMethods } from './anonymize-gar-authentication-methods.usecase.js';
import { anonymizeUser } from './anonymize-user.usecase.js';
import { authenticateAnonymousUser } from './authenticate-anonymous-user.usecase.js';
import { authenticateApplication } from './authenticate-application.js';
import { authenticateForSaml } from './authenticate-for-saml.usecase.js';
import { authenticateOidcUser } from './authenticate-oidc-user.usecase.js';
import { authenticateUser } from './authenticate-user.js';
import { changeUserLanguage } from './change-user-language.usecase.js';
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
import { getReadyIdentityProviders } from './get-ready-identity-providers.usecase.js';
import { getRedirectLogoutUrl } from './get-redirect-logout-url.usecase.js';
import { getSamlAuthenticationRedirectionUrl } from './get-saml-authentication-redirection-url.js';
import { getUserAccountInfo } from './get-user-account-info.usecase.js';
import { getUserByResetPasswordDemand } from './get-user-by-reset-password-demand.usecase.js';
import { getUserDetailsForAdmin } from './get-user-details-for-admin.usecase.js';
import { importUserLastLoggedAt } from './import-user-last-logged-at.usecase.js';
import { listLtiPublicKeys } from './list-lti-public-keys.usecase.js';
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

const usecases = {
  acceptPixCertifTermsOfService,
  acceptPixLastTermsOfService,
  acceptPixOrgaTermsOfService,
  addOidcProvider,
  addPixAuthenticationMethod,
  anonymizeGarAuthenticationMethods,
  anonymizeUser,
  authenticateAnonymousUser,
  authenticateApplication,
  authenticateForSaml,
  authenticateOidcUser,
  authenticateUser,
  changeUserLanguage,
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
  getReadyIdentityProviders,
  getRedirectLogoutUrl,
  getSamlAuthenticationRedirectionUrl,
  getUserAccountInfo,
  getUserByResetPasswordDemand,
  getUserDetailsForAdmin,
  importUserLastLoggedAt,
  listLtiPublicKeys,
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
  updateUserForAccountRecovery,
  updateUserPassword,
  upgradeToRealUser,
  validateUserAccountEmail,
};

export { usecases };

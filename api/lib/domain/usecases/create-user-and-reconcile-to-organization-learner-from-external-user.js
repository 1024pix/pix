import { CampaignCodeError, ObjectValidationError } from '../errors.js';
import { User } from '../models/User.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../constants/identity-providers.js';
import { STUDENT_RECONCILIATION_ERRORS } from '../constants.js';

const existingUserReconciliationErrors = [
  STUDENT_RECONCILIATION_ERRORS.RECONCILIATION.IN_SAME_ORGANIZATION.samlId.code,
  STUDENT_RECONCILIATION_ERRORS.RECONCILIATION.IN_OTHER_ORGANIZATION.samlId.code,
];

const createUserAndReconcileToOrganizationLearnerFromExternalUser = async function ({
  birthdate,
  campaignCode,
  token,
  obfuscationService,
  tokenService,
  userReconciliationService,
  userService,
  authenticationMethodRepository,
  campaignRepository,
  userRepository,
  userToCreateRepository,
  organizationLearnerRepository,
  studentRepository,
}) {
  const campaign = await campaignRepository.getByCode(campaignCode);
  if (!campaign) {
    throw new CampaignCodeError();
  }

  const externalUser = await tokenService.extractExternalUserFromIdToken(token);

  if (!externalUser.firstName || !externalUser.lastName || !externalUser.samlId) {
    throw new ObjectValidationError('Missing claim(s) in IdToken');
  }

  const reconciliationInfo = {
    firstName: externalUser.firstName,
    lastName: externalUser.lastName,
    birthdate,
  };

  const domainUser = new User({
    firstName: externalUser.firstName,
    lastName: externalUser.lastName,
    cgu: false,
  });

  let matchedOrganizationLearner;
  let userWithSamlId;
  let userId;

  try {
    matchedOrganizationLearner =
      await userReconciliationService.findMatchingOrganizationLearnerIdForGivenOrganizationIdAndUser({
        organizationId: campaign.organizationId,
        reconciliationInfo,
        organizationLearnerRepository,
      });

    await userReconciliationService.checkIfStudentHasAnAlreadyReconciledAccount(
      matchedOrganizationLearner,
      userRepository,
      obfuscationService,
      studentRepository,
    );

    userWithSamlId = await userRepository.getBySamlId(externalUser.samlId);
    if (!userWithSamlId) {
      userId = await userService.createAndReconcileUserToOrganizationLearner({
        user: domainUser,
        organizationLearnerId: matchedOrganizationLearner.id,
        samlId: externalUser.samlId,
        authenticationMethodRepository,
        organizationLearnerRepository,
        userToCreateRepository,
      });
    }
  } catch (error) {
    if (existingUserReconciliationErrors.includes(error.code)) {
      await authenticationMethodRepository.updateExternalIdentifierByUserIdAndIdentityProvider({
        externalIdentifier: externalUser.samlId,
        userId: error.meta.userId,
        identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
      });
      const organizationLearner = await organizationLearnerRepository.reconcileUserToOrganizationLearner({
        userId: error.meta.userId,
        organizationLearnerId: matchedOrganizationLearner.id,
      });
      userId = organizationLearner.userId;
    } else {
      throw error;
    }
  }
  const tokenUserId = userWithSamlId ? userWithSamlId.id : userId;
  const accessToken = tokenService.createAccessTokenForSaml(tokenUserId);
  await userRepository.updateLastLoggedAt({ userId: tokenUserId });
  return accessToken;
};

export { createUserAndReconcileToOrganizationLearnerFromExternalUser };

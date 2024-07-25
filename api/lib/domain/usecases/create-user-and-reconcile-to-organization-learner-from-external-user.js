import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../src/identity-access-management/domain/constants/identity-providers.js';
import { AuthenticationMethod } from '../../../src/identity-access-management/domain/models/AuthenticationMethod.js';
import { User } from '../../../src/identity-access-management/domain/models/User.js';
import { CampaignCodeError, ObjectValidationError } from '../../../src/shared/domain/errors.js';
import { DomainTransaction } from '../../infrastructure/DomainTransaction.js';
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
  userLoginRepository,
  userToCreateRepository,
  organizationLearnerRepository,
  studentRepository,
}) {
  const campaign = await campaignRepository.getByCode(campaignCode);
  if (!campaign) {
    throw new CampaignCodeError();
  }

  const externalUser = await tokenService.extractExternalUserFromIdToken(token);
  const firstName = externalUser.firstName;
  const lastName = externalUser.lastName;
  const samlId = externalUser.samlId;

  if (!firstName || !lastName || !samlId) {
    throw new ObjectValidationError('Missing claim(s) in IdToken');
  }

  const reconciliationInfo = {
    firstName,
    lastName,
    birthdate,
  };

  let matchedOrganizationLearner;
  let userWithSamlId;
  let userId;

  try {
    matchedOrganizationLearner =
      await userReconciliationService.findMatchingOrganizationLearnerForGivenOrganizationIdAndReconciliationInfo({
        organizationId: campaign.organizationId,
        reconciliationInfo,
        organizationLearnerRepository,
      });

    await userReconciliationService.assertStudentHasAnAlreadyReconciledAccount(
      matchedOrganizationLearner,
      userRepository,
      obfuscationService,
      studentRepository,
    );

    userWithSamlId = await userRepository.getBySamlId(externalUser.samlId);
    if (!userWithSamlId) {
      const domainUser = new User({
        firstName,
        lastName,
        cgu: false,
      });
      userId = await userService.createAndReconcileUserToOrganizationLearner({
        user: domainUser,
        organizationLearnerId: matchedOrganizationLearner.id,
        samlId,
        authenticationMethodRepository,
        organizationLearnerRepository,
        userToCreateRepository,
      });
    }
  } catch (error) {
    if (existingUserReconciliationErrors.includes(error.code)) {
      const reconciliationUserId = error.meta.userId;
      const identityProvider = NON_OIDC_IDENTITY_PROVIDERS.GAR.code;

      await DomainTransaction.execute(async (domainTransaction) => {
        await authenticationMethodRepository.updateExternalIdentifierByUserIdAndIdentityProvider({
          externalIdentifier: samlId,
          userId: reconciliationUserId,
          identityProvider,
          domainTransaction,
        });

        const authenticationComplement = new AuthenticationMethod.GARAuthenticationComplement({
          firstName,
          lastName,
        });
        await authenticationMethodRepository.updateAuthenticationComplementByUserIdAndIdentityProvider({
          authenticationComplement,
          userId: reconciliationUserId,
          identityProvider,
          domainTransaction,
        });
        const organizationLearner = await organizationLearnerRepository.reconcileUserToOrganizationLearner({
          userId: reconciliationUserId,
          organizationLearnerId: matchedOrganizationLearner.id,
          domainTransaction,
        });
        userId = organizationLearner.userId;
      });
    } else {
      throw error;
    }
  }
  const tokenUserId = userWithSamlId ? userWithSamlId.id : userId;
  const accessToken = tokenService.createAccessTokenForSaml(tokenUserId);
  await userLoginRepository.updateLastLoggedAt({ userId: tokenUserId });
  return accessToken;
};

export { createUserAndReconcileToOrganizationLearnerFromExternalUser };

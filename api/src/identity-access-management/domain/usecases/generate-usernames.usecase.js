import { OrganizationLearnerPasswordResetDTO } from '../../../shared/domain/models/OrganizationLearnerPasswordResetDTO.js';
import {
  OrganizationLearnerDoesAlreadyHaveAnUsernameError,
  OrganizationLearnerDoesNotBelongToOrganizationError,
  OrganizationLearnerDoesNotHaveAPixAccountError,
} from '../errors.js';

export const generateUsernames = async function ({
  organizationLearnerIds,
  organizationId,
  passwordGeneratorService,
  cryptoService,
  userReconciliationService,
  userService,
  authenticationMethodRepository,
  userRepository,
  organizationLearnerRepository,
}) {
  const updatedOrganizationLearners = [];
  const organizationLearners = await organizationLearnerRepository.findByIds({ ids: organizationLearnerIds });
  _checkIfOrganizationLearnersBelongsToOrganization(organizationLearners, organizationId);

  const organizationLearnerUserIds = organizationLearners.map((organizationLearner) => organizationLearner.userId);
  _checkIfOrganizationLearnersHaveAPixAccount(organizationLearnerUserIds);
  const organizationLearnerUserAccounts = await userRepository.getByIds(organizationLearnerUserIds);
  _checkIfUserAccountsHaveUsername(organizationLearnerUserAccounts);

  for (const organizationLearner of organizationLearners) {
    const organizationLearnerUserAccount = organizationLearnerUserAccounts.find(
      (userAccount) => userAccount.id === organizationLearner.userId,
    );
    const username = await userReconciliationService.createUsernameByUser({
      user: organizationLearner,
      userRepository,
    });
    const hasStudentAccountAnIdentityProviderPIX = await authenticationMethodRepository.hasIdentityProviderPIX({
      userId: organizationLearnerUserAccount.id,
    });

    if (hasStudentAccountAnIdentityProviderPIX) {
      await userRepository.updateUsername({ id: organizationLearnerUserAccount.id, username });
      updatedOrganizationLearners.push(
        new OrganizationLearnerPasswordResetDTO({
          division: organizationLearner.division,
          lastName: organizationLearner.lastName,
          firstName: organizationLearner.firstName,
          username,
          password: '',
        }),
      );
    } else {
      const generatedPassword = passwordGeneratorService.generateSimplePassword();
      const hashedPassword = await cryptoService.hashPassword(generatedPassword);

      await userService.updateUsernameAndAddPassword({
        userId: organizationLearnerUserAccount.id,
        username,
        hashedPassword,
        authenticationMethodRepository,
        userRepository,
      });
      updatedOrganizationLearners.push(
        new OrganizationLearnerPasswordResetDTO({
          division: organizationLearner.division,
          lastName: organizationLearner.lastName,
          firstName: organizationLearner.firstName,
          username,
          password: generatedPassword,
        }),
      );
    }
  }
  return updatedOrganizationLearners;
};

function _checkIfOrganizationLearnersBelongsToOrganization(organizationLearners, organizationId) {
  const organizationLearnersBelongToOrganization = organizationLearners.every(
    (organizationLearner) => organizationLearner.organizationId === organizationId,
  );
  if (!organizationLearnersBelongToOrganization) {
    throw new OrganizationLearnerDoesNotBelongToOrganizationError();
  }
}

function _checkIfOrganizationLearnersHaveAPixAccount(organizationLearnerUserIds) {
  if (organizationLearnerUserIds.some((userId) => !userId)) {
    throw new OrganizationLearnerDoesNotHaveAPixAccountError();
  }
}

function _checkIfUserAccountsHaveUsername(userAccounts) {
  const someUserAccountsHaveUsername = userAccounts.some((organizationLearner) => organizationLearner.username);
  if (someUserAccountsHaveUsername) {
    throw new OrganizationLearnerDoesAlreadyHaveAnUsernameError();
  }
}

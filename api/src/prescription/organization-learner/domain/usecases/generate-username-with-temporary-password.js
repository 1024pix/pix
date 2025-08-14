import lodash from 'lodash';

const { isEmpty } = lodash;

import * as injectedPasswordGenerator from '../../../../identity-access-management/domain/services/password-generator.service.js';
import * as injectedAuthenticationMethodRepository from '../../../../identity-access-management/infrastructure/repositories/authentication-method.repository.js';
import * as injectedUserRepository from '../../../../identity-access-management/infrastructure/repositories/user.repository.js';
import { UserNotAuthorizedToGenerateUsernamePasswordError } from '../../../../shared/domain/errors.js';
import { cryptoService as injectedCryptoService } from '../../../../shared/domain/services/crypto-service.js';
import * as injectedUserReconciliationService from '../../../../shared/domain/services/user-reconciliation-service.js';
import * as injectedUserService from '../../../../shared/domain/services/user-service.js';
import * as injectedPrescriptionOrganizationLearnerRepository from '../../../learner-management/infrastructure/repositories/organization-learner-repository.js';

const generateUsernameWithTemporaryPassword = async function ({
  organizationLearnerId,
  organizationId,
  passwordGenerator = injectedPasswordGenerator,
  cryptoService = injectedCryptoService,
  userReconciliationService = injectedUserReconciliationService,
  userService = injectedUserService,
  authenticationMethodRepository = injectedAuthenticationMethodRepository,
  userRepository = injectedUserRepository,
  prescriptionOrganizationLearnerRepository = injectedPrescriptionOrganizationLearnerRepository,
} = {}) {
  const organizationLearner = await prescriptionOrganizationLearnerRepository.getLearnerInfo(organizationLearnerId);
  _checkIfStudentHasAccessToOrganization(organizationLearner, organizationId);

  const studentAccount = await userRepository.get(organizationLearner.userId);
  _checkIfStudentAccountAlreadyHasUsername(studentAccount);

  const username = await userReconciliationService.createUsernameByUser({
    user: organizationLearner,
    userRepository,
  });

  const hasStudentAccountAnIdentityProviderPIX = await authenticationMethodRepository.hasIdentityProviderPIX({
    userId: studentAccount.id,
  });

  if (hasStudentAccountAnIdentityProviderPIX) {
    const updatedUser = await userRepository.updateUsername({ id: studentAccount.id, username });
    return { username: updatedUser.username };
  } else {
    const generatedPassword = passwordGenerator.generateSimplePassword();
    const hashedPassword = await cryptoService.hashPassword(generatedPassword);

    // and Create Password
    await userService.updateUsernameAndAddPassword({
      userId: studentAccount.id,
      username,
      hashedPassword,
      authenticationMethodRepository,
      userRepository,
    });

    return { username, generatedPassword, organizationLearnerId };
  }
};

export { generateUsernameWithTemporaryPassword };

function _checkIfStudentHasAccessToOrganization(organizationLearner, organizationId) {
  if (organizationLearner.organizationId !== organizationId) {
    throw new UserNotAuthorizedToGenerateUsernamePasswordError(
      `L'élève avec l'INE ${organizationLearner.nationalStudentId} n'appartient pas à l'organisation.`,
    );
  }
}

function _checkIfStudentAccountAlreadyHasUsername(studentAccount) {
  if (!isEmpty(studentAccount.username)) {
    throw new UserNotAuthorizedToGenerateUsernamePasswordError(
      `Ce compte utilisateur dispose déjà d'un identifiant: ${studentAccount.username}.`,
    );
  }
}

import lodash from 'lodash';
const { isNil } = lodash;

import { createAccountCreationEmail } from '../../../../identity-access-management/domain/emails/create-account-creation.email.js';
import { User } from '../../../../identity-access-management/domain/models/User.js';
import * as injectedAuthenticationMethodRepository from '../../../../identity-access-management/infrastructure/repositories/authentication-method.repository.js';
import { emailValidationDemandRepository as injectedEmailValidationDemandRepository } from '../../../../identity-access-management/infrastructure/repositories/email-validation-demand.repository.js';
import * as injectedUserRepository from '../../../../identity-access-management/infrastructure/repositories/user.repository.js';
import { userToCreateRepository as injectedUserToCreateRepository } from '../../../../identity-access-management/infrastructure/repositories/user-to-create.repository.js';
import { STUDENT_RECONCILIATION_ERRORS } from '../../../../shared/domain/constants.js';
import { EntityValidationError } from '../../../../shared/domain/errors.js';
import { AlreadyRegisteredEmailError } from '../../../../shared/domain/errors.js';
import {
  AlreadyRegisteredUsernameError,
  OrganizationLearnerAlreadyLinkedToUserError,
} from '../../../../shared/domain/errors.js';
import { cryptoService as injectedCryptoService } from '../../../../shared/domain/services/crypto-service.js';
import * as injectedObfuscationService from '../../../../shared/domain/services/obfuscation-service.js';
import * as injectedUserReconciliationService from '../../../../shared/domain/services/user-reconciliation-service.js';
import * as injectedUserService from '../../../../shared/domain/services/user-service.js';
import * as injectedPasswordValidator from '../../../../shared/domain/validators/password-validator.js';
import * as injectedUserValidator from '../../../../shared/domain/validators/user-validator.js';
import * as injectedEmailRepository from '../../../../shared/mail/infrastructure/repositories/email.repository.js';
import * as injectedLibOrganizationLearnerRepository from '../../infrastructure/repositories/organization-learner-repository.js';

const createAndReconcileUserToOrganizationLearner = async function ({
  organizationId,
  redirectionUrl,
  locale,
  password,
  userAttributes,
  authenticationMethodRepository = injectedAuthenticationMethodRepository,
  emailRepository = injectedEmailRepository,
  emailValidationDemandRepository = injectedEmailValidationDemandRepository,
  libOrganizationLearnerRepository = injectedLibOrganizationLearnerRepository,
  userRepository = injectedUserRepository,
  userToCreateRepository = injectedUserToCreateRepository,
  cryptoService = injectedCryptoService,
  obfuscationService = injectedObfuscationService,
  userReconciliationService = injectedUserReconciliationService,
  userService = injectedUserService,
  passwordValidator = injectedPasswordValidator,
  userValidator = injectedUserValidator,
} = {}) {
  const matchedOrganizationLearner =
    await userReconciliationService.findMatchingOrganizationLearnerForGivenOrganizationIdAndReconciliationInfo({
      organizationId,
      reconciliationInfo: userAttributes,
      organizationLearnerRepository: libOrganizationLearnerRepository,
      userRepository,
      obfuscationService,
    });

  const organizationLearnerFound = !isNil(matchedOrganizationLearner.userId);
  if (organizationLearnerFound) {
    const detail = 'Un compte existe déjà pour l‘élève dans le même établissement.';
    const error = STUDENT_RECONCILIATION_ERRORS.LOGIN_OR_REGISTER.IN_SAME_ORGANIZATION.username;
    const meta = {
      shortCode: error.shortCode,
    };
    throw new OrganizationLearnerAlreadyLinkedToUserError(detail, error.code, meta);
  }

  const isUsernameMode = userAttributes.withUsername;
  const cleanedUserAttributes = _emptyOtherMode(isUsernameMode, userAttributes);

  await _validateData({
    isUsernameMode,
    password,
    userAttributes: cleanedUserAttributes,
    userRepository,
    passwordValidator,
    userValidator,
  });

  const hashedPassword = await _encryptPassword(password, cryptoService);
  const domainUser = _createDomainUser(cleanedUserAttributes);

  const userId = await userService.createAndReconcileUserToOrganizationLearner({
    hashedPassword,
    organizationLearnerId: matchedOrganizationLearner.id,
    user: domainUser,
    authenticationMethodRepository,
    organizationLearnerRepository: libOrganizationLearnerRepository,
    userToCreateRepository,
  });

  const createdUser = await userRepository.get(userId);
  if (!isUsernameMode) {
    const token = await emailValidationDemandRepository.save(createdUser.id);

    await emailRepository.sendEmailAsync(
      createAccountCreationEmail({
        locale,
        email: createdUser.email,
        firstName: createdUser.firstName,
        token,
        redirectionUrl,
      }),
    );
  }
  return createdUser;
};

function _encryptPassword(userPassword, cryptoService) {
  const encryptedPassword = cryptoService.hashPassword(userPassword);

  if (encryptedPassword === userPassword) {
    throw new Error('Erreur lors de l‘encryption du mot passe de l‘utilisateur');
  }

  return encryptedPassword;
}

function _createDomainUser(userAttributes) {
  return new User({
    firstName: userAttributes.firstName,
    lastName: userAttributes.lastName,
    email: userAttributes.email,
    username: userAttributes.username,
    cgu: false,
  });
}

function _manageEmailAvailabilityError(error) {
  error = new AlreadyRegisteredEmailError();
  return _manageError(
    error,
    AlreadyRegisteredEmailError,
    'email',
    'Cette adresse e-mail est déjà enregistrée, connectez-vous.',
  );
}

function _manageUsernameAvailabilityError(error) {
  return _manageError(
    error,
    AlreadyRegisteredUsernameError,
    'username',
    'Cet identifiant n’est plus disponible, merci de recharger la page.',
  );
}

function _manageError(error, errorType, attribute, message) {
  if (error instanceof errorType) {
    throw new EntityValidationError({
      invalidAttributes: [{ attribute, message }],
    });
  }
  throw error;
}

function _emptyOtherMode(isUsernameMode, userAttributes) {
  return isUsernameMode ? { ...userAttributes, email: undefined } : { ...userAttributes, username: undefined };
}

function _validatePassword(password, passwordValidator) {
  let result;
  try {
    passwordValidator.validate(password);
  } catch (err) {
    result = err;
  }
  return result;
}

async function _validateData({
  isUsernameMode,
  password,
  userAttributes,
  userRepository,
  userValidator,
  passwordValidator,
}) {
  const validationErrors = [];

  try {
    userValidator.validate({ user: userAttributes, cguRequired: false });
  } catch (err) {
    validationErrors.push(err);
  }

  validationErrors.push(_validatePassword(password, passwordValidator));

  if (isUsernameMode) {
    try {
      await userRepository.isUsernameAvailable(userAttributes.username);
    } catch (err) {
      validationErrors.push(_manageUsernameAvailabilityError(err));
    }
  } else {
    try {
      await userRepository.checkIfEmailIsAvailable(userAttributes.email);
    } catch (err) {
      validationErrors.push(_manageEmailAvailabilityError(err));
    }
  }

  const relevantErrors = validationErrors.filter((error) => error instanceof Error);
  if (relevantErrors.length > 0) {
    throw EntityValidationError.fromMultipleEntityValidationErrors(relevantErrors);
  }
}

export { createAndReconcileUserToOrganizationLearner };

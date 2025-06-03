import lodash from 'lodash';
const { isNil } = lodash;

import { createAccountCreationEmail } from '../../../../identity-access-management/domain/emails/create-account-creation.email.js';
import { User } from '../../../../identity-access-management/domain/models/User.js';
import { STUDENT_RECONCILIATION_ERRORS } from '../../../../shared/domain/constants.js';
import { EntityValidationError } from '../../../../shared/domain/errors.js';
import { AlreadyRegisteredEmailError } from '../../../../shared/domain/errors.js';
import {
  AlreadyRegisteredUsernameError,
  OrganizationLearnerAlreadyLinkedToUserError,
} from '../../../../shared/domain/errors.js';

const createAndReconcileUserToOrganizationLearner = async function ({
  organizationId,
  redirectionUrl,
  locale,
  password,
  userAttributes,
  authenticationMethodRepository,
  emailRepository,
  emailValidationDemandRepository,
  libOrganizationLearnerRepository,
  userRepository,
  userToCreateRepository,
  cryptoService,
  obfuscationService,
  userReconciliationService,
  userService,
  passwordValidator,
  userValidator,
}) {
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

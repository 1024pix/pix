const isNil = require('lodash/isNil');

const {
  AlreadyRegisteredEmailError,
  AlreadyRegisteredUsernameError,
  CampaignCodeError,
  EntityValidationError,
  SchoolingRegistrationAlreadyLinkedToUserError,
} = require('../errors');

const User = require('../models/User');

const passwordValidator = require('../validators/password-validator');
const userValidator = require('../validators/user-validator');

const { getCampaignUrl } = require('../../infrastructure/utils/url-builder');

function _encryptPassword(userPassword, encryptionService) {
  const encryptedPassword = encryptionService.hashPassword(userPassword);

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
  return _manageError(error, AlreadyRegisteredEmailError, 'email', 'Cette adresse e-mail est déjà enregistrée, connectez-vous.');
}

function _manageUsernameAvailabilityError(error) {
  return _manageError(error, AlreadyRegisteredUsernameError, 'username', 'Cet identifiant n’est plus disponible, merci de recharger la page.');
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
  return isUsernameMode
    ? { ...userAttributes, email: undefined }
    : { ...userAttributes, username: undefined };
}

function _validatePassword(password) {
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
}) {
  const validationErrors = [];

  try {
    userValidator.validate({ user: userAttributes, cguRequired: false });
  } catch (err) {
    validationErrors.push(err);
  }

  validationErrors.push(_validatePassword(password));

  if (isUsernameMode) {
    try {
      await userRepository.isUsernameAvailable(userAttributes.username);
    } catch (err) {
      validationErrors.push(_manageUsernameAvailabilityError(err));
    }
  } else {
    try {
      await userRepository.isEmailAvailable(userAttributes.email);
    } catch (err) {
      validationErrors.push(_manageEmailAvailabilityError(err));
    }
  }

  const relevantErrors = validationErrors.filter((error) => error instanceof Error);
  if (relevantErrors.length > 0) {
    throw EntityValidationError.fromMultipleEntityValidationErrors(relevantErrors);
  }
}

module.exports = async function createAndReconcileUserToSchoolingRegistration({
  campaignCode,
  locale,
  password,
  userAttributes,
  authenticationMethodRepository,
  campaignRepository,
  schoolingRegistrationRepository,
  userRepository,
  encryptionService,
  mailService,
  obfuscationService,
  userReconciliationService,
  userService,
}) {
  const campaign = await campaignRepository.getByCode(campaignCode);
  if (!campaign) {
    throw new CampaignCodeError();
  }

  const matchedSchoolingRegistration = await userReconciliationService.findMatchingSchoolingRegistrationIdForGivenOrganizationIdAndUser({
    organizationId: campaign.organizationId,
    reconciliationInfo: userAttributes,
    schoolingRegistrationRepository,
    userRepository,
    obfuscationService,
  });

  if (!isNil(matchedSchoolingRegistration.userId)) {
    throw new SchoolingRegistrationAlreadyLinkedToUserError('Un compte existe déjà pour l‘élève dans le même établissement.');
  }

  const isUsernameMode = userAttributes.withUsername;
  const cleanedUserAttributes = _emptyOtherMode(isUsernameMode, userAttributes);

  await _validateData({
    isUsernameMode,
    password,
    userAttributes: cleanedUserAttributes,
    userRepository,
  });

  const hashedPassword = await _encryptPassword(password, encryptionService);
  const domainUser = _createDomainUser(cleanedUserAttributes);

  const userId = await userService.createAndReconcileUserToSchoolingRegistration({
    hashedPassword,
    schoolingRegistrationId: matchedSchoolingRegistration.id,
    user: domainUser,
    authenticationMethodRepository,
    schoolingRegistrationRepository,
    userRepository,
  });

  const createdUser = await userRepository.get(userId);
  if (!isUsernameMode) {
    const redirectionUrl = getCampaignUrl(locale, campaignCode);
    await mailService.sendAccountCreationEmail(createdUser.email, locale, redirectionUrl);
  }
  return createdUser;
};

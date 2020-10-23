const {
  AlreadyRegisteredEmailError,
  AlreadyRegisteredUsernameError,
  CampaignCodeError,
  EntityValidationError,
  SchoolingRegistrationAlreadyLinkedToUserError,
} = require('../errors');
const User = require('../models/User');

const userValidator = require('../validators/user-validator');
const { getCampaignUrl } = require('../../infrastructure/utils/url-builder');
const isNil = require('lodash/isNil');

function _encryptPassword(userPassword, encryptionService) {
  const encryptedPassword = encryptionService.hashPassword(userPassword);

  if (encryptedPassword === userPassword) {
    throw new Error('Erreur lors de l‘encryption du mot passe de l‘utilisateur');
  }

  return encryptedPassword;
}

function _createDomainUser(userAttributes, encryptedPawsword) {
  return new User({
    firstName: userAttributes.firstName,
    lastName: userAttributes.lastName,
    email: userAttributes.email,
    username: userAttributes.username,
    password: encryptedPawsword,
    cgu: false,
  });
}

function  _manageEmailAvailabilityError(error) {
  return _manageError(error, AlreadyRegisteredEmailError, 'email', 'Cette adresse e-mail est déjà enregistrée, connectez-vous.');
}

function  _manageUsernameAvailabilityError(error) {
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
  return isUsernameMode ? { ...userAttributes, email: undefined } : { ...userAttributes, username: undefined };
}

async function _validateData(isUsernameMode, userAttributes, userRepository, userValidator) {
  const validationErrors = [];
  try {
    userValidator.validate({ user: userAttributes, cguRequired: false });
  } catch (err) {
    validationErrors.push(err);
  }

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
  userAttributes,
  campaignCode,
  locale,
  campaignRepository,
  schoolingRegistrationRepository,
  userRepository,
  encryptionService,
  mailService,
  obfuscationService,
  userReconciliationService,
}) {
  const campaign = await campaignRepository.getByCode(campaignCode);
  if (!campaign) {
    throw new CampaignCodeError();
  }

  const matchedSchoolingRegistration = await userReconciliationService.findMatchingSchoolingRegistrationIdForGivenOrganizationIdAndUser({ organizationId: campaign.organizationId, reconciliationInfo: userAttributes, schoolingRegistrationRepository, userRepository, obfuscationService });

  if (!isNil(matchedSchoolingRegistration.userId)) {
    throw new SchoolingRegistrationAlreadyLinkedToUserError('Un compte existe déjà pour l‘élève dans le même établissement.');
  }

  const isUsernameMode = userAttributes.withUsername;
  const cleanedUserAttributes = _emptyOtherMode(isUsernameMode, userAttributes);
  await _validateData(isUsernameMode, cleanedUserAttributes, userRepository, userValidator);

  const encryptedPassword = await _encryptPassword(cleanedUserAttributes.password, encryptionService);
  const domainUser = _createDomainUser(cleanedUserAttributes, encryptedPassword);

  const userId = await userRepository.createAndReconcileUserToSchoolingRegistration({ domainUser, schoolingRegistrationId: matchedSchoolingRegistration.id });

  const createdUser = await userRepository.get(userId);
  if (!isUsernameMode) {
    const redirectionUrl = getCampaignUrl(locale, campaignCode);
    await mailService.sendAccountCreationEmail(createdUser.email, locale, redirectionUrl);
  }
  return createdUser;
};

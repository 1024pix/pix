const { AlreadyRegisteredEmailError, AlreadyRegisteredUsernameError, CampaignCodeError, EntityValidationError } = require('../errors');
const User = require('../models/User');

const userValidator = require('../validators/user-validator');

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
    cgu: false
  });
}

function  _manageEmailAvailabilityError(error) {
  return _manageError(error, AlreadyRegisteredEmailError, 'email', 'Cette adresse e-mail est déjà enregistrée, connectez-vous.');
}

function  _manageUsernameAvailabilityError(error) {
  return _manageError(error, AlreadyRegisteredUsernameError, 'username', 'Cet identifiant est déjà utilisé, rechargez la page.');
}

function _manageError(error, errorType, attribute, message) {
  if (error instanceof errorType) {
    throw new EntityValidationError({
      invalidAttributes: [{ attribute, message }]
    });
  }

  throw error;
}

function _emptyOtherMode(isUsernameMode, userAttributes) {
  return isUsernameMode ? { ...userAttributes, email: undefined } : { ...userAttributes, username: undefined };
}

async function _validateData(isUsernameMode, userAttributes, userRepository, userValidator) {
  const validationErrors = await Promise.all([
    isUsernameMode ? userRepository.isUsernameAvailable(userAttributes.username).catch(_manageUsernameAvailabilityError) : userRepository.isEmailAvailable(userAttributes.email).catch(_manageEmailAvailabilityError),
    userValidator.validate({ user: userAttributes, cguRequired: false }).catch((error) => error),
  ]);
  // Promise.all returns the return value of all promises, even if the return value is undefined
  const relevantErrors = validationErrors.filter((error) => error instanceof Error);
  if (relevantErrors.length > 0) {
    throw EntityValidationError.fromMultipleEntityValidationErrors(relevantErrors);
  }
}

module.exports = async function createAndAssociateUserToStudent({
  userAttributes,
  campaignCode,
  campaignRepository,
  studentRepository,
  userRepository,
  encryptionService,
  mailService,
  userReconciliationService,
}) {
  const campaign = await campaignRepository.getByCode(campaignCode);
  if (!campaign || !campaign.organizationId) {
    throw new CampaignCodeError();
  }

  const studentId = await userReconciliationService.findMatchingOrganizationStudentIdForGivenUser({ organizationId: campaign.organizationId, user: userAttributes, studentRepository });

  const isUsernameMode = userAttributes.withUsername;
  const cleanedUserAttributes = _emptyOtherMode(isUsernameMode, userAttributes);
  await _validateData(isUsernameMode, cleanedUserAttributes, userRepository, userValidator);

  const encryptedPassword = await _encryptPassword(cleanedUserAttributes.password, encryptionService);
  const domainUser = _createDomainUser(cleanedUserAttributes, encryptedPassword);

  const userId = await userRepository.createAndAssociateUserToStudent({ domainUser, studentId });

  const createdUser = await userRepository.get(userId);
  if (!isUsernameMode) await mailService.sendAccountCreationEmail(createdUser.email);
  return createdUser;
};

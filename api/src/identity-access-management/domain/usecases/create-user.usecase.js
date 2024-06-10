import { AlreadyRegisteredEmailError } from '../../../../lib/domain/errors.js';
import { getCampaignUrl } from '../../../../lib/infrastructure/utils/url-builder.js';
import { EntityValidationError } from '../../../shared/domain/errors.js';

/**
 * @param {Object} params
 * @property {string} campaignCode
 * @property {string} localeFromHeader
 * @property {string} password
 * @property {string} user
 * @property {import('../../../shared/infrastructure/repositories/authentication-method-repository.js').AuthenticationMethodRepository} authenticationMethodRepository
 * @property {Object} campaignRepository
 * @property {import('../../../shared/infrastructure/repositories').UserRepository} userRepository
 * @property {import('../../../shared/infrastructure/repositories').UserToCreateRepository} userToCreateRepository
 * @property {import('../../../shared/domain/services').CryptoService} cryptoService
 * @property {Object} mailService
 * @property {import('../../../shared/domain/services/user-service.js').UserService} userService
 * @property {import('../../../shared/domain/validators').UserValidator} userValidator
 * @property {import('../../../shared/domain/validators').PasswordValidator} passwordValidator
 * @return {Promise<User|undefined>}
 */
const createUser = async function ({
  campaignCode,
  localeFromHeader,
  password,
  user,
  authenticationMethodRepository,
  campaignRepository,
  userRepository,
  userToCreateRepository,
  cryptoService,
  mailService,
  userService,
  userValidator,
  passwordValidator,
}) {
  const isValid = await _validateData({
    password,
    user,
    userRepository,
    userValidator,
    passwordValidator,
  });

  const userHasValidatedPixTermsOfService = user.cgu === true;
  if (userHasValidatedPixTermsOfService) {
    user.lastTermsOfServiceValidatedAt = new Date();
  }

  if (isValid) {
    const hashedPassword = await cryptoService.hashPassword(password);

    const savedUser = await userService.createUserWithPassword({
      user,
      hashedPassword,
      userToCreateRepository,
      authenticationMethodRepository,
    });

    let redirectionUrl = null;

    if (campaignCode) {
      const campaign = await campaignRepository.getByCode(campaignCode);
      if (campaign) {
        redirectionUrl = getCampaignUrl(localeFromHeader, campaignCode);
      }
    }

    await mailService.sendAccountCreationEmail(savedUser.email, localeFromHeader, redirectionUrl);

    return savedUser;
  }
};

export { createUser };

/**
 * @param error
 * @return {EntityValidationError}
 * @private
 */
function _manageEmailAvailabilityError(error) {
  return _manageError(error, AlreadyRegisteredEmailError, 'email', 'ALREADY_REGISTERED_EMAIL');
}

/**
 * @param error
 * @param errorType
 * @param attribute
 * @param message
 * @return {EntityValidationError|Error}
 * @private
 */
function _manageError(error, errorType, attribute, message) {
  if (error instanceof errorType) {
    return new EntityValidationError({
      invalidAttributes: [{ attribute, message }],
    });
  }
  throw error;
}

/**
 * @param password
 * @param passwordValidator
 * @return {Error|undefined}
 * @private
 */
function _validatePassword(password, passwordValidator) {
  let result;
  try {
    passwordValidator.validate(password);
  } catch (err) {
    result = err;
  }
  return result;
}

/**
 * @param {Object} dataToValidate
 * @property {string} password
 * @property {string} user
 * @property {import('../../infrastructure/repositories/user.repository.js').UserRepository} userRepository
 * @property {import('../../../shared/domain/validators/user-validator.js').UserValidator} userValidator
 * @property {import('../../../shared/domain/validators/password-validator.js').PasswordValidator} passwordValidator
 * @return {Promise<boolean>}
 * @private
 */
async function _validateData({ password, user, userRepository, userValidator, passwordValidator }) {
  let userValidatorError;
  try {
    userValidator.validate({ user });
  } catch (err) {
    userValidatorError = err;
  }

  const passwordValidatorError = _validatePassword(password, passwordValidator);

  const validationErrors = [];
  if (user.email) {
    validationErrors.push(
      await userRepository.checkIfEmailIsAvailable(user.email).catch(_manageEmailAvailabilityError),
    );
  }
  validationErrors.push(userValidatorError);
  validationErrors.push(passwordValidatorError);

  if (validationErrors.some((error) => error instanceof Error)) {
    const relevantErrors = validationErrors.filter((error) => error instanceof Error);
    throw EntityValidationError.fromMultipleEntityValidationErrors(relevantErrors);
  }

  return true;
}

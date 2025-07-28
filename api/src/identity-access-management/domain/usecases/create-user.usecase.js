import { withTransaction } from '../../../shared/domain/DomainTransaction.js';
import { EntityValidationError } from '../../../shared/domain/errors.js';
import { createAccountCreationEmail } from '../emails/create-account-creation.email.js';
import { InvalidOrAlreadyUsedEmailError } from '../errors.js';

/**
 * @param {Object} params
 * @property {string} campaignCode
 * @property {string} locale
 * @property {string} password
 * @property {string} user
 * @property {import('../../infrastructure/repositories/authentication-method.repository.js').AuthenticationMethodRepository} authenticationMethodRepository
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
const createUser = withTransaction(async function ({
  locale,
  password,
  user,
  authenticationMethodRepository,
  redirectionUrl,
  emailRepository,
  emailValidationDemandRepository,
  userRepository,
  userToCreateRepository,
  cryptoService,
  userService,
  userValidator,
  passwordValidator,
}) {
  await _assertValidData({
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

  const hashedPassword = await cryptoService.hashPassword(password);

  const savedUser = await userService.createUserWithPassword({
    user,
    hashedPassword,
    userToCreateRepository,
    authenticationMethodRepository,
  });

  const token = await emailValidationDemandRepository.save(savedUser.id);

  await emailRepository.sendEmailAsync(
    createAccountCreationEmail({
      locale,
      email: savedUser.email,
      firstName: savedUser.firstName,
      token,
      redirectionUrl,
    }),
  );

  return savedUser;
});

export { createUser };

/**
 * @param error
 * @return {EntityValidationError}
 * @private
 */
function _manageEmailAvailabilityError(error) {
  return _manageError(error, InvalidOrAlreadyUsedEmailError, 'email', 'INVALID_OR_ALREADY_USED_EMAIL');
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
async function _assertValidData({ password, user, userRepository, userValidator, passwordValidator }) {
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
}

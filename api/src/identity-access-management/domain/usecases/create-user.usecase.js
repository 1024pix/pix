import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { EntityValidationError } from '../../../shared/domain/errors.js';
import { child, SCOPES } from '../../../shared/infrastructure/utils/logger.js';
import { createAccountCreationEmail } from '../emails/create-account-creation.email.js';
import { InvalidOrAlreadyUsedEmailError } from '../errors.js';

const logger = child('iam:create-user', { event: SCOPES.IAM });

/**
 * @param {Object} params
 * @param {string} params.locale
 * @param {string} params.password
 * @param {string} params.user
 * @param {string} params.redirectionUrl
 * @param {import('../../infrastructure/repositories/authentication-method.repository.js').AuthenticationMethodRepository} params.authenticationMethodRepository
 * @param {Object} params.campaignRepository
 * @param {import('../../infrastructure/repositories/user.repository.js')} params.userRepository
 * @param {import('../../infrastructure/repositories/user-to-create.repository.js')} params.userToCreateRepository
 * @param {import('../../../shared/domain/services/crypto-service.js')} params.cryptoService
 * @param {import('../services/user-service.js')} params.userService
 * @param {import('../../../shared/domain/validators/user-validator.js')} params.userValidator
 * @param {import('../../../shared/domain/validators/password-validator.js')} params.passwordValidator
 * @return {Promise<User|undefined>}
 */
const createUser = async function ({
  locale,
  password,
  user,
  redirectionUrl,
  authenticationMethodRepository,
  emailRepository,
  emailValidationDemandRepository,
  userRepository,
  userToCreateRepository,
  legalDocumentApiRepository,
  cryptoService,
  userService,
  userValidator,
  passwordValidator,
}) {
  const { savedUser, token } = await DomainTransaction.execute(async () => {
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
      locale,
      hashedPassword,
      userToCreateRepository,
      authenticationMethodRepository,
    });

    await legalDocumentApiRepository.acceptPixAppTos({ userId: savedUser.id });

    const token = await emailValidationDemandRepository.save(savedUser.id);

    return { savedUser, token };
  });

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
};

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
 * @param {import('../../../shared/domain/validators/password-validator.js')} passwordValidator
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
 * @param {Object} params
 * @param {string} params.password
 * @param {string} params.user
 * @param {import('../../infrastructure/repositories/user.repository.js')} params.userRepository
 * @param {import('../../../shared/domain/validators/user-validator.js')} params.userValidator
 * @param {import('../../../shared/domain/validators/password-validator.js')} params.passwordValidator
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
    for (const error of relevantErrors) {
      logger.warn(error, 'user creation validation error');
    }
    throw EntityValidationError.fromMultipleEntityValidationErrors(relevantErrors);
  }
}

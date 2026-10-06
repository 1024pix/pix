import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { EntityValidationError } from '../../../shared/domain/errors.js';
import { child, SCOPES } from '../../../shared/infrastructure/utils/logger.js';
import { InvalidOrAlreadyUsedEmailError } from '../errors.js';
import { AuthenticationMethod } from '../models/AuthenticationMethod.js';
import { UserToCreate } from '../models/UserToCreate.js';

const logger = child('iam:user-service', { event: SCOPES.IAM });

/**
 * @param user
 * @param locale
 * @param hashedPassword
 * @param userToCreateRepository
 * @param authenticationMethodRepository
 * @return {Promise<*>}
 */
export async function createUserWithPassword({
  user,
  locale,
  hashedPassword,
  userToCreateRepository,
  authenticationMethodRepository,
}) {
  const userToAdd = UserToCreate.create({ ...user, locale });
  const savedUser = await userToCreateRepository.create({ user: userToAdd });

  const authenticationMethod = AuthenticationMethod.buildPixAuthenticationMethod({
    userId: savedUser.id,
    password: hashedPassword,
  });
  await authenticationMethodRepository.create({ authenticationMethod });

  return savedUser;
}

/**
 * @param userId
 * @param username
 * @param hashedPassword
 * @param authenticationMethodRepository
 * @param userRepository
 * @return {Promise<*|Promise<unknown>>}
 */
export async function updateUsernameAndAddPassword({
  userId,
  username,
  hashedPassword,
  authenticationMethodRepository,
  userRepository,
}) {
  return DomainTransaction.execute(async () => {
    await userRepository.updateUsername({ id: userId, username });
    return authenticationMethodRepository.createPasswordThatShouldBeChanged({ userId, hashedPassword });
  });
}

/**
 * @param user
 * @param samlId
 * @param hashedPassword
 * @param locale
 * @param authenticationMethodRepository
 * @param userToCreateRepository
 * @return {Promise<*|Promise<unknown>>}
 */
export async function createUserWithGarOrPassword({
  user,
  samlId,
  hashedPassword,
  locale,
  authenticationMethodRepository,
  userToCreateRepository,
}) {
  const userToAdd = UserToCreate.create({ ...user, locale });

  return DomainTransaction.execute(async () => {
    let authenticationMethod;

    const createdUser = await userToCreateRepository.create({ user: userToAdd });

    if (samlId) {
      authenticationMethod = AuthenticationMethod.buildGARAuthenticationMethod({
        userId: createdUser.id,
        firstName: createdUser.firstName,
        lastName: createdUser.lastName,
        externalIdentifier: samlId,
      });
    } else {
      authenticationMethod = AuthenticationMethod.buildPixAuthenticationMethod({
        userId: createdUser.id,
        password: hashedPassword,
      });
    }
    await authenticationMethodRepository.create({ authenticationMethod });

    return createdUser.id;
  });
}

/**
 * @param {Object} params
 * @param {string} params.password
 * @param {import('../models/User.js').User} params.user
 * @param {import('../../infrastructure/repositories/user.repository.js')} params.userRepository
 * @param {import('../../../shared/domain/validators/user-validator.js')} params.userValidator
 * @param {import('../../../shared/domain/validators/password-validator.js')} params.passwordValidator
 * @return {Promise<boolean>}
 */
export async function validateUserWithPasswordForCreation({
  password,
  user,
  userRepository,
  userValidator,
  passwordValidator,
}) {
  let userValidatorError;
  try {
    userValidator.validate({ user });
  } catch (err) {
    userValidatorError = err;
  }

  const passwordValidatorError = validatePassword(password, passwordValidator);

  const validationErrors = [];
  if (user.email) {
    validationErrors.push(
      await userRepository.checkIfEmailIsAvailable(user.email, user.id).catch(manageEmailAvailabilityError),
    );
  }
  validationErrors.push(userValidatorError);
  validationErrors.push(passwordValidatorError);

  if (validationErrors.some((error) => error instanceof Error)) {
    const relevantErrors = validationErrors.filter((error) => error instanceof Error);
    for (const error of relevantErrors) {
      logger.debug(error, 'user creation validation error');
    }
    throw EntityValidationError.fromMultipleEntityValidationErrors(relevantErrors);
  }
}

/**
 * @param password
 * @param {import('../../../shared/domain/validators/password-validator.js')} passwordValidator
 * @return {Error|undefined}
 * @private
 */
function validatePassword(password, passwordValidator) {
  let result;
  try {
    passwordValidator.validate(password);
  } catch (err) {
    result = err;
  }
  return result;
}

/**
 * @param error
 * @return {EntityValidationError}
 * @private
 */
function manageEmailAvailabilityError(error) {
  return manageError(error, InvalidOrAlreadyUsedEmailError, 'email', 'INVALID_OR_ALREADY_USED_EMAIL');
}

/**
 * @param error
 * @param errorType
 * @param attribute
 * @param message
 * @return {EntityValidationError|Error}
 * @private
 */
function manageError(error, errorType, attribute, message) {
  if (error instanceof errorType) {
    return new EntityValidationError({
      invalidAttributes: [{ attribute, message }],
    });
  }
  throw error;
}

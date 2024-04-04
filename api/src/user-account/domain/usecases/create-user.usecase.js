import { AlreadyRegisteredEmailError } from '../../../../lib/domain/errors.js';
import { getCampaignUrl } from '../../../../lib/infrastructure/utils/url-builder.js';
import { EntityValidationError } from '../../../shared/domain/errors.js';

function _manageEmailAvailabilityError(error) {
  return _manageError(error, AlreadyRegisteredEmailError, 'email', 'ALREADY_REGISTERED_EMAIL');
}

function _manageError(error, errorType, attribute, message) {
  if (error instanceof errorType) {
    return new EntityValidationError({
      invalidAttributes: [{ attribute, message }],
    });
  }
  throw error;
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

const createUser = async function ({
  campaignCode,
  localeFromHeader,
  password,
  user,
  //dependencies
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

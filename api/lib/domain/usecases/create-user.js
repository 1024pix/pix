import { AlreadyRegisteredEmailError, EntityValidationError } from '../errors';
import userValidator from '../validators/user-validator';
import passwordValidator from '../validators/password-validator';
import { getCampaignUrl } from '../../infrastructure/utils/url-builder';

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

function _validatePassword(password) {
  let result;
  try {
    passwordValidator.validate(password);
  } catch (err) {
    result = err;
  }
  return result;
}

async function _validateData({ password, user, userRepository }) {
  let userValidatorError;
  try {
    userValidator.validate({ user });
  } catch (err) {
    userValidatorError = err;
  }

  const passwordValidatorError = _validatePassword(password);

  const validationErrors = [];
  if (user.email) {
    validationErrors.push(
      await userRepository.checkIfEmailIsAvailable(user.email).catch(_manageEmailAvailabilityError)
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

export default async function createUser({
  user,
  password,
  campaignCode,
  locale,
  authenticationMethodRepository,
  campaignRepository,
  userRepository,
  userToCreateRepository,
  encryptionService,
  mailService,
  userService,
}) {
  const isValid = await _validateData({
    password,
    user,
    userRepository,
  });

  const userHasValidatedPixTermsOfService = user.cgu === true;
  if (userHasValidatedPixTermsOfService) {
    user.lastTermsOfServiceValidatedAt = new Date();
  }

  if (isValid) {
    const hashedPassword = await encryptionService.hashPassword(password);

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
        redirectionUrl = getCampaignUrl(locale, campaignCode);
      }
    }

    await mailService.sendAccountCreationEmail(savedUser.email, locale, redirectionUrl);

    return savedUser;
  }
}

const {
  AlreadyRegisteredEmailError,
  EntityValidationError,
  InvalidRecaptchaTokenError,
} = require('../errors');

const userValidator = require('../validators/user-validator');
const passwordValidator = require('../validators/password-validator');

const { getCampaignUrl } = require('../../infrastructure/utils/url-builder');

function _manageEmailAvailabilityError(error) {
  return _manageError(error, AlreadyRegisteredEmailError, 'email', 'Cette adresse e-mail est déjà enregistrée, connectez-vous.');
}

function _manageReCaptchaTokenError(error) {
  return _manageError(error, InvalidRecaptchaTokenError, 'recaptchaToken', 'Merci de cocher la case ci-dessous :');
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

async function _validateData({
  password,
  user,
  reCaptchaToken,
  userRepository,
  reCaptchaValidator,
}) {
  let userValidatorError;
  try {
    userValidator.validate({ user });
  } catch (err) {
    userValidatorError = err;
  }

  const passwordValidatorError = _validatePassword(password);

  const promises = [reCaptchaValidator.verify(reCaptchaToken).catch(_manageReCaptchaTokenError)];
  if (user.email) {
    promises.push(userRepository.isEmailAvailable(user.email).catch(_manageEmailAvailabilityError));
  }

  const validationErrors = await Promise.all(promises);
  validationErrors.push(userValidatorError);
  validationErrors.push(passwordValidatorError);

  if (validationErrors.some((error) => error instanceof Error)) {
    const relevantErrors = validationErrors.filter((error) => error instanceof Error);
    throw EntityValidationError.fromMultipleEntityValidationErrors(relevantErrors);
  }

  return true;
}

module.exports = async function createUser({
  user,
  password,
  campaignCode,
  reCaptchaToken,
  locale,
  authenticationMethodRepository,
  campaignRepository,
  userRepository,
  reCaptchaValidator,
  encryptionService,
  mailService,
  userService,
}) {
  const isValid = await _validateData({
    password,
    user,
    reCaptchaToken,
    userRepository,
    reCaptchaValidator,
  });

  if (isValid) {
    const hashedPassword = await encryptionService.hashPassword(password);

    const savedUser = await userService.createUserWithPassword({
      user,
      hashedPassword,
      userRepository,
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
};

const { AlreadyRegisteredEmailError, InvalidRecaptchaTokenError, EntityValidationError } = require('../errors');
const User = require('../models/User');

const userValidator = require('../validators/user-validator');
const { getCampaignUrl } = require('../../infrastructure/utils/url-builder');

function  _manageEmailAvailabilityError(error) {
  return _manageError(error, AlreadyRegisteredEmailError, 'email', 'Cette adresse e-mail est déjà enregistrée, connectez-vous.');
}

function  _manageReCaptchaTokenError(error) {
  return _manageError(error, InvalidRecaptchaTokenError, 'recaptchaToken', 'Merci de cocher la case ci-dessous :');
}

function _manageError(error, errorType, attribute, message) {
  if (error instanceof errorType) {
    return new EntityValidationError({
      invalidAttributes: [{ attribute, message }]
    });
  }

  throw error;
}

async function _validateData(user, reCaptchaToken, userRepository, userValidator, reCaptchaValidator) {
  let userValidatorError;
  try {
    userValidator.validate({ user });
  } catch (err) {
    userValidatorError = err;
  }
  const promises = [reCaptchaValidator.verify(reCaptchaToken).catch(_manageReCaptchaTokenError)];
  if (user.email) {
    promises.push(userRepository.isEmailAvailable(user.email).catch(_manageEmailAvailabilityError));
  }

  const validationErrors = await Promise.all(promises);
  validationErrors.push(userValidatorError);

  if (validationErrors.some((error) => error instanceof Error)) {
    const relevantErrors = validationErrors.filter((error) => error instanceof Error);
    throw EntityValidationError.fromMultipleEntityValidationErrors(relevantErrors);
  }

  return true;
}

module.exports = async function createUser({
  user,
  campaignCode,
  reCaptchaToken,
  locale,
  userRepository,
  campaignRepository,
  reCaptchaValidator,
  encryptionService,
  mailService,
}) {
  const isValid = await _validateData(user, reCaptchaToken, userRepository, userValidator, reCaptchaValidator);

  if (isValid) {
    const encryptedPassword = await encryptionService.hashPassword(user.password);

    const userWithEncryptedPassword = new User({ ... user, password: encryptedPassword });
    const savedUser = await userRepository.create(userWithEncryptedPassword);

    let redirectionUrl = null;

    if (campaignCode) {
      const campaign = await campaignRepository.getByCode(campaignCode);
      if (campaign && campaign.organizationId) {
        redirectionUrl = getCampaignUrl(locale, campaignCode);
      }
    }

    await mailService.sendAccountCreationEmail(savedUser.email, locale, redirectionUrl);
    return savedUser;
  }
};

const { AlreadyRegisteredEmailError, InvalidRecaptchaTokenError, EntityValidationError } = require('../errors');
const User = require('../models/User');

const userValidator = require('../validators/user-validator');

function  _manageEmailAvailabilityError(error) {
  return _manageError(error, AlreadyRegisteredEmailError, 'email', 'Cette adresse électronique est déjà enregistrée, connectez-vous.');
}

function  _manageReCaptchaTokenError(error) {
  return _manageError(error, InvalidRecaptchaTokenError, 'recaptchaToken', 'Merci de cocher la case ci-dessous :');
}

function _manageError(error, errorType, attribute, message) {
  if(error instanceof errorType) {
    return new EntityValidationError({
      invalidAttributes: [{ attribute, message }]
    });
  }

  throw error;
}

function _validateData(user, reCaptchaToken, userRepository, userValidator, reCaptchaValidator) {
  return Promise.all([
    userRepository.isEmailAvailable(user.email).catch(_manageEmailAvailabilityError),
    userValidator.validate(user).catch((error) => error),
    reCaptchaValidator.verify(reCaptchaToken).catch(_manageReCaptchaTokenError)
  ])
    .then((validationErrors) => {
      // Promise.all returns the return value of all promises, even if the return value is undefined
      const relevantErrors = validationErrors.filter((error) => error instanceof Error);
      if (relevantErrors.length > 0) {
        throw EntityValidationError.fromMultipleEntityValidationErrors(relevantErrors);
      }
    });
}

function _checkEncryptedPassword(userPassword, encryptedPassword) {
  if(encryptedPassword === userPassword) {
    throw new Error('Erreur lors de l‘encryption du mot passe de l‘utilisateur');
  }

  return encryptedPassword;
}

module.exports = function createUser({
  user,
  reCaptchaToken,
  userRepository,
  reCaptchaValidator,
  encryptionService,
  mailService,
}) {
  return _validateData(user, reCaptchaToken, userRepository, userValidator, reCaptchaValidator)
    .then(() => encryptionService.hashPassword(user.password))
    .then((encryptedPassword) => _checkEncryptedPassword(user.password, encryptedPassword))
    .then((encryptedPassword) => {
      const userWithEncryptedPassword = new User(user);
      userWithEncryptedPassword.password = encryptedPassword;
      return userWithEncryptedPassword;
    })
    .then(userRepository.create)
    .then((savedUser) => {
      mailService.sendAccountCreationEmail(savedUser.email);
      return savedUser;
    });
};

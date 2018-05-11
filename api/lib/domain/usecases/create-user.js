const errors = require('../errors');
const User = require('../models/User');

function  _manageEmailAvailabilityError(error) {
  if(error instanceof errors.AlreadyRegisteredEmailError) {
    return new errors.EntityValidationError({
      invalidAttributes: [
        {
          attribute: 'email',
          message: 'Cette adresse electronique est déjà enregistrée.',
        }
      ]
    });
  }
}

function  _manageReCaptchaTokenError(error) {
  if(error instanceof errors.InvalidRecaptchaTokenError) {
    return new errors.EntityValidationError({
      invalidAttributes: [
        {
          attribute: 'recaptchaToken',
          message: 'Merci de cocher la case ci-dessous :',
        }
      ]
    });
  }
}

module.exports = function({
  user,
  reCaptchaToken,
  userRepository,
  userValidator,
  reCaptchaValidator,
  encryptionService,
  mailService,
}) {
  return Promise.all([
    userRepository.isEmailAvailable(user.email).catch(_manageEmailAvailabilityError),
    userValidator.validate(user).catch((error) => error),
    reCaptchaValidator.verify(reCaptchaToken).catch(_manageReCaptchaTokenError)
  ])
    .then((validationErrors) => {
      // Promise.all returns the return value of all promises, even if the return value is undefined
      const relevantErrors = validationErrors.filter((error) => error instanceof Error);
      if (relevantErrors.length > 0) {
        throw errors.EntityValidationError.fromEntityValidationErrors(relevantErrors);
      }
    })
    .then(() => encryptionService.hashPassword(user.password))
    .then((encryptedPassword) => {
      const userWithEncryptedPassword = new User(user);
      userWithEncryptedPassword.password = encryptedPassword;
      return userWithEncryptedPassword;
    })
    .then(userRepository.save)
    .then((savedUser) => {
      mailService.sendAccountCreationEmail(savedUser.email);
      return savedUser;
    });
};

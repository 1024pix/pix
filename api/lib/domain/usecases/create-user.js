const { FormValidationError } = require('../errors');
const User = require('../models/User');

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
    userRepository.isEmailAvailable(user.email).catch((error) => error),
    userValidator.validate(user).catch((error) => error),
    reCaptchaValidator.verify(reCaptchaToken).catch((error) => error)
  ])
    .then((errors) => {
      // Promise.all returns the return value of all promises, even if the return value is undefined
      const relevantErrors = errors.filter((error) => error instanceof Error);
      if (relevantErrors.length > 0) {
        throw new FormValidationError(relevantErrors);
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

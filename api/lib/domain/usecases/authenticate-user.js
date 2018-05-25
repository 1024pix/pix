const encryptionService = require('../../domain/services/encryption-service');
const { MissingOrInvalidCredentialsError } = require('../../domain/errors');

module.exports = function({ userEmail, password, userRepository, tokenService }) {
  let user;
  return userRepository.findByEmail(userEmail)
    .then(foundUser => (user = foundUser))
    .then(() => encryptionService.check(password, user.password))
    .then(() => tokenService.createTokenFromUser(user))
    .catch(() => {
      throw new MissingOrInvalidCredentialsError();
    });

};

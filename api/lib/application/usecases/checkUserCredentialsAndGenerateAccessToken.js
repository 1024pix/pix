const userRepository = require('../../infrastructure/repositories/user-repository');
const encryptionService = require('../../domain/services/encryption-service');
const tokenService = require('../../domain/services/token-service');
const { MissingOrInvalidCredentialsError } = require('../../domain/errors');

module.exports = {

  execute(username, password) {
    let user;
    return userRepository.findByEmail(username)
      .then(foundUser => (user = foundUser))
      .then(() => encryptionService.check(password, user.password))
      .then(() => tokenService.createTokenFromUser(user))
      .catch(() => {
        throw new MissingOrInvalidCredentialsError();
      });
  }

};

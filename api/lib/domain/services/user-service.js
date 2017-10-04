const userRepository = require('../../../lib/infrastructure/repositories/user-repository');
const { UserNotFoundError } = require('../errors');

module.exports = {
  isUserExisting(email) {
    return userRepository
      .findByEmail(email)
      .then(() => true)
      .catch(() => {
        throw new UserNotFoundError();
      });
  }
};

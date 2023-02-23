const { UserIsTemporaryBlocked, UserIsBlocked } = require('../../domain/errors.js');
const userLoginRepository = require('../../infrastructure/repositories/user-login-repository.js');

module.exports = {
  async execute(username) {
    const foundUserLogin = await userLoginRepository.findByUsername(username);
    if (foundUserLogin?.isUserMarkedAsBlocked()) {
      throw new UserIsBlocked();
    }
    if (foundUserLogin?.isUserMarkedAsTemporaryBlocked()) {
      throw new UserIsTemporaryBlocked();
    }
  },
};

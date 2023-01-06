const { UserIsTemporaryBlocked, UserIsBlocked } = require('../../domain/errors');
const userLoginRepository = require('../../infrastructure/repositories/user-login-repository');

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

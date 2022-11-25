const { UserIsTemporaryBlocked } = require('../../domain/errors');
const userLoginRepository = require('../../infrastructure/repositories/user-login-repository');

module.exports = {
  async execute(username) {
    const foundUserLogin = await userLoginRepository.findByUsername(username);
    if (foundUserLogin?.isUserTemporaryBlocked()) {
      throw new UserIsTemporaryBlocked();
    }
  },
};

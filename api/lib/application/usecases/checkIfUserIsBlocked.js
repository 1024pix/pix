import { UserIsTemporaryBlocked, UserIsBlocked } from '../../domain/errors';
import userLoginRepository from '../../infrastructure/repositories/user-login-repository';

export default {
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

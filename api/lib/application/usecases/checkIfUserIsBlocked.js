import * as userLoginRepository from '../../../src/shared/infrastructure/repositories/user-login-repository.js';
import { UserIsBlocked, UserIsTemporaryBlocked } from '../../domain/errors.js';

const execute = async function (username) {
  const foundUserLogin = await userLoginRepository.findByUsername(username);
  if (foundUserLogin?.isUserMarkedAsBlocked()) {
    throw new UserIsBlocked();
  }
  if (foundUserLogin?.isUserMarkedAsTemporaryBlocked()) {
    throw new UserIsTemporaryBlocked();
  }
};

export { execute };

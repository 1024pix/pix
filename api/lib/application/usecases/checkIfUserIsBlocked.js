import { UserIsTemporaryBlocked, UserIsBlocked } from '../../domain/errors.js';
import * as userLoginRepository from '../../../src/shared/infrastructure/repositories/user-login-repository.js';

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

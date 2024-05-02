import { cryptoService } from '../../../shared/domain/services/crypto-service.js';
import * as userLoginRepository from '../../../shared/infrastructure/repositories/user-login-repository.js';
import { PasswordNotMatching } from '../errors.js';

async function getUserByUsernameAndPassword({
  username,
  password,
  userRepository,
  dependencies = { userLoginRepository, cryptoService },
}) {
  const foundUser = await userRepository.getByUsernameOrEmailWithRolesAndPassword(username);
  const passwordHash = foundUser.authenticationMethods[0].authenticationComplement.password;

  let userLogin = await dependencies.userLoginRepository.findByUserId(foundUser.id);
  if (!userLogin) {
    userLogin = await dependencies.userLoginRepository.create({ userId: foundUser.id });
  }

  try {
    await dependencies.cryptoService.checkPassword({
      password,
      passwordHash,
    });
  } catch (error) {
    if (error instanceof PasswordNotMatching) {
      userLogin.incrementFailureCount();

      if (userLogin.shouldMarkUserAsBlocked()) {
        userLogin.markUserAsBlocked();
      } else if (userLogin.shouldMarkUserAsTemporarilyBlocked()) {
        userLogin.markUserAsTemporarilyBlocked();
      }

      await dependencies.userLoginRepository.update(userLogin);
    }

    throw error;
  }

  if (userLogin.hasFailedAtLeastOnce()) {
    userLogin.resetUserTemporaryBlocking();
    await dependencies.userLoginRepository.update(userLogin);
  }

  return foundUser;
}

export { getUserByUsernameAndPassword };

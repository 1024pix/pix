import { PasswordNotMatching, UserIsBlocked, UserIsTemporaryBlocked } from '../../../shared/domain/errors.js';
import { cryptoService } from '../../../shared/domain/services/crypto-service.js';
import * as userLoginRepository from '../../infrastructure/repositories/user-login-repository.js';

/**
 * @typedef {function} getUserByUsernameAndPassword
 * @param {Object} params
 * @param {string} params.username
 * @param {string} params.password
 * @param {UserRepository} params.userRepository
 * @param {Object} params.dependencies
 * @return {Promise<User|UserNotFoundError|PasswordNotMatching>}
 */
async function getUserByUsernameAndPassword({
  username,
  password,
  userRepository,
  dependencies = { userLoginRepository, cryptoService },
}) {
  const foundUser = await userRepository.getByUsernameOrEmailWithRolesAndPassword(username);

  let userLogin = await dependencies.userLoginRepository.findByUserId(foundUser.id);
  if (!userLogin) {
    userLogin = await dependencies.userLoginRepository.create({ userId: foundUser.id });
  }

  try {
    const passwordHash = foundUser.passwordHash;
    await dependencies.cryptoService.checkPassword({ password, passwordHash });
  } catch (error) {
    if (error instanceof PasswordNotMatching) {
      userLogin.incrementFailureCount();

      if (userLogin.shouldMarkUserAsBlocked()) {
        userLogin.markUserAsBlocked();
      } else if (userLogin.shouldMarkUserAsTemporarilyBlocked()) {
        userLogin.markUserAsTemporarilyBlocked();
      }

      await dependencies.userLoginRepository.update(userLogin);

      const isLoginFailureWithUsername = username === foundUser.username;

      if (userLogin.isUserMarkedAsBlocked()) {
        throw new UserIsBlocked({ isLoginFailureWithUsername });
      } else if (userLogin.isUserMarkedAsTemporaryBlocked()) {
        throw new UserIsTemporaryBlocked({
          isLoginFailureWithUsername,
          blockingDurationMs: userLogin.computeBlockingDurationMs(),
        });
      }

      throw new PasswordNotMatching({
        remainingAttempts: userLogin.shouldWarnRemainingAttempts && userLogin.remainingAttempts,
        isLoginFailureWithUsername,
      });
    }

    throw error;
  }

  if (userLogin.hasFailedAtLeastOnce()) {
    userLogin.resetUserTemporaryBlocking();
    await dependencies.userLoginRepository.update(userLogin);
  }

  return foundUser;
}

/**
 * @typedef {Object} PixAuthenticationService
 * @property {getUserByUsernameAndPassword} getUserByUsernameAndPassword
 */
export const pixAuthenticationService = { getUserByUsernameAndPassword };

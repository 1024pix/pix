import * as injectedUserLoginRepository from '../../../shared/infrastructure/repositories/user-login-repository.js';
import * as injectedUserRepository from '../../infrastructure/repositories/user.repository.js';
import { UserLogin } from '../models/UserLogin.js';

/**
 * @typedef {function} importUserLastLoggedAt
 * @param {Object} params
 * @param {boolean} params.dryRun
 * @param {string} params.userId
 * @param {Date} params.lastActivity
 * @param {UserRepository} params.userRepository
 * @param {UserLoginRepository} params.userLoginRepository
 * @return {Promise<boolean>}
 */
export const importUserLastLoggedAt = async function ({
  dryRun,
  userId,
  lastActivity,
  userRepository = injectedUserRepository,
  userLoginRepository = injectedUserLoginRepository,
} = {}) {
  const user = await userRepository.findById(userId);
  if (!user || user.hasBeenAnonymised) {
    return false;
  }

  const userLogin = await userLoginRepository.findByUserId(userId);
  if (!userLogin) {
    const newUserLogin = new UserLogin({ userId, lastLoggedAt: lastActivity });
    if (!dryRun) await userLoginRepository.create(newUserLogin);
    return true;
  }

  if (userLogin.lastLoggedAt) {
    return false;
  }

  userLogin.lastLoggedAt = lastActivity;
  if (!dryRun) await userLoginRepository.update(userLogin, { preventUpdatedAt: true });
  return true;
};

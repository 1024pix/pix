import * as injectedPrivacyUsersApiRepository from '../../infrastructure/repositories/privacy-users-api.repository.js';
import * as injectedUserRepository from '../../infrastructure/repositories/user.repository.js';
import { UserAccountInfo } from '../models/UserAccountInfo.js';

const getUserAccountInfo = async ({
  userId,
  userRepository = injectedUserRepository,
  privacyUsersApiRepository = injectedPrivacyUsersApiRepository,
} = {}) => {
  const user = await userRepository.get(userId);

  const canSelfDeleteAccount = await privacyUsersApiRepository.canSelfDeleteAccount({ userId });

  return new UserAccountInfo({
    id: user.id,
    email: user.email,
    username: user.username,
    canSelfDeleteAccount,
  });
};

export { getUserAccountInfo };

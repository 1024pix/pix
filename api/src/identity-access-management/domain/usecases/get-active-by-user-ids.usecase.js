import * as injectedUserRepository from '../../infrastructure/repositories/user.repository.js';
export const getActiveByUserIds = async function ({ userIds, userRepository = injectedUserRepository } = {}) {
  const users = await userRepository.getByIds(userIds);

  return users.filter((user) => !user.isActive);
};

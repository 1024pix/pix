import * as injectedUserLoginRepository from '../../../shared/infrastructure/repositories/user-login-repository.js';
const unblockUserAccount = async function ({ userId, userLoginRepository = injectedUserLoginRepository } = {}) {
  const userLogin = await userLoginRepository.getByUserId(userId);
  userLogin.resetUserBlocking();

  return await userLoginRepository.update(userLogin);
};

export { unblockUserAccount };

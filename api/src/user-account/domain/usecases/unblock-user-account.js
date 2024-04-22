const unblockUserAccount = async function ({ userId, userLoginRepository }) {
  const userLogin = await userLoginRepository.getByUserId(userId);
  userLogin.resetUserBlocking();

  return await userLoginRepository.update(userLogin);
};

export { unblockUserAccount };

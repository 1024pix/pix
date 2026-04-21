/**
 * @param {Object} params
 * @param {string} params.userId - The ID of the user to unblock
 * @param {UserLoginRepository} params.userLoginRepository
 * @returns {Promise<UserLogin>} The updated user login record
 */
const unblockUserAccount = async function ({ userId, userLoginRepository }) {
  const userLogin = await userLoginRepository.getByUserId(userId);
  userLogin.resetUserBlocking();

  return await userLoginRepository.update(userLogin);
};

export { unblockUserAccount };

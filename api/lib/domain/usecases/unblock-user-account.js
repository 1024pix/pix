module.exports = async function unblockUserAccount({ userId, userLoginRepository }) {
  const userLogin = await userLoginRepository.findByUserId(userId);
  userLogin.unblockUser();

  return await userLoginRepository.update(userLogin);
};

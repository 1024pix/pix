export default async function unblockUserAccount({ userId, userLoginRepository }) {
  const userLogin = await userLoginRepository.findByUserId(userId);
  userLogin.resetUserBlocking();

  return await userLoginRepository.update(userLogin);
}

/**
 * @param {{
 *   userId: string,
 *   language: string,
 *   userRepository: UserRepository
 * }} params
 * @return {Promise<User>}
 */
export const changeUserLanguage = async function ({ userId, language, userRepository }) {
  await userRepository.update({ id: userId, lang: language });
  return userRepository.getFullById(userId);
};

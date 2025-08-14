import * as injectedUserRepository from '../../infrastructure/repositories/user.repository.js'; /**
 * @param {{
 *   userId: string,
 *   language: string,
 *   userRepository: UserRepository
 * }} params
 * @return {Promise<User>}
 */
export const changeUserLanguage = async function ({ userId, language, userRepository = injectedUserRepository } = {}) {
  await userRepository.update({ id: userId, lang: language });
  return userRepository.getFullById(userId);
};

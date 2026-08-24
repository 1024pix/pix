import { getBaseLocale } from '../../../shared/domain/services/locale-service.js';

/**
 * @param {{
 *   userId: string,
 *   locale: string,
 *   userRepository: UserRepository
 * }} params
 * @return {Promise<User>}
 */
export const changeUserLocale = async function ({ userId, locale, userRepository }) {
  const lang = getBaseLocale(locale);

  await userRepository.update({ id: userId, lang, locale });
  return userRepository.get(userId);
};

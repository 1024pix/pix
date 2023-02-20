export default function changeUserLang({ userId, lang, userRepository }) {
  return userRepository.updateUserAttributes(userId, { lang });
}

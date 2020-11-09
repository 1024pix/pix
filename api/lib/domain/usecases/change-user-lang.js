module.exports = function changeUserLang({
  userId,
  lang,
  userRepository,
}) {
  return userRepository.updateUserAttributes(userId, { lang });
};

module.exports = async function changeUserLang({ userId, lang, userRepository }) {
  await userRepository.update({ id: userId, lang });
  return userRepository.getFullById(userId);
};

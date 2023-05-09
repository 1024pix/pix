const changeUserLang = async function ({ userId, lang, userRepository }) {
  await userRepository.update({ id: userId, lang });
  return userRepository.getFullById(userId);
};

export { changeUserLang };

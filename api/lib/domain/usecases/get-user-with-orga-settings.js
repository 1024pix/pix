module.exports = async function getUserWithOrgaSettings({ userId, userRepository }) {
  return userRepository.getWithOrgaSettings(userId);
};

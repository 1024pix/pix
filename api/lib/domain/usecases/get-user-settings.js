const getUserSettings = async function ({ userId, userSettingsRepository }) {
  const userSettings = await userSettingsRepository.get(userId);
  return userSettings;
};

export { getUserSettings };

import { UserSettings } from '../models/UserSettings.js';

const updateUserColor = async function ({ userId, color, userSettingsRepository }) {
  let userSettings;

  try {
    userSettings = await userSettingsRepository.get(userId);
  } catch (e) {
    userSettings = new UserSettings({ userId });
  }

  userSettings.color = color;

  return userSettingsRepository.save(userSettings);
};

export { updateUserColor };

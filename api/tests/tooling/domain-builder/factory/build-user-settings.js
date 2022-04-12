import { UserSettings } from '../../../../lib/domain/models/UserSettings.js';

function buildUserSettings({ userId, color = 'red' } = {}) {
  return new UserSettings({
    userId,
    color,
  });
}

export { buildUserSettings };

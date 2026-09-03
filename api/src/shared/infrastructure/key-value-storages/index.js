import { config } from '../../config.js';
import { InMemoryKeyValueStorage } from './InMemoryKeyValueStorage.js';
import { RedisKeyValueStorage } from './RedisKeyValueStorage.js';

function _createKeyValueStorage({ prefix }) {
  if (config.redisUrl) {
    return new RedisKeyValueStorage(config.redisUrl, prefix);
  } else {
    return new InMemoryKeyValueStorage();
  }
}

export const temporaryStorage = _createKeyValueStorage({ prefix: 'temporary-storage:' });
export const informationBannersStorage = _createKeyValueStorage({ prefix: 'information-banners:' });
export const featureTogglesStorage = _createKeyValueStorage({ prefix: 'feature-toggles:' });
export const announcementsStorage = _createKeyValueStorage({ prefix: 'announcements:' });

export async function quitAllStorages() {
  await temporaryStorage.quit();
  await informationBannersStorage.quit();
  await featureTogglesStorage.quit();
  await announcementsStorage.quit();
}

import { settings } from '../../config.js';
const REDIS_URL = settings.temporaryStorage.redisUrl;

import { InMemoryTemporaryStorage } from './InMemoryTemporaryStorage.js';
import { RedisTemporaryStorage } from './RedisTemporaryStorage.js';

function _createTemporaryStorage() {
  if (REDIS_URL) {
    return new RedisTemporaryStorage(REDIS_URL);
  } else {
    return new InMemoryTemporaryStorage();
  }
}

const temporaryStorage = _createTemporaryStorage();

export { temporaryStorage };

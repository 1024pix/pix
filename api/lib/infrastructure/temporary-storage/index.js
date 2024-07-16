import { config } from '../../../src/shared/config.js';

const redisUrl = config.temporaryStorage.redisUrl;

import { InMemoryTemporaryStorage } from './InMemoryTemporaryStorage.js';
import { RedisTemporaryStorage } from './RedisTemporaryStorage.js';

function _createTemporaryStorage() {
  if (redisUrl) {
    return new RedisTemporaryStorage(redisUrl);
  } else {
    return new InMemoryTemporaryStorage();
  }
}

const temporaryStorage = _createTemporaryStorage();

export { temporaryStorage };

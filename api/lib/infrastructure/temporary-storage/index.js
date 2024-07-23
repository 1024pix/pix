import { config } from '../../../src/shared/config.js';

const redisUrl = config.temporaryStorage.redisUrl;

import { RedisTemporaryStorage } from '../../../src/shared/infrastructure/temporary-storage/RedisTemporaryStorage.js';
import { InMemoryTemporaryStorage } from './InMemoryTemporaryStorage.js';

function _createTemporaryStorage() {
  if (redisUrl) {
    return new RedisTemporaryStorage(redisUrl);
  } else {
    return new InMemoryTemporaryStorage();
  }
}

const temporaryStorage = _createTemporaryStorage();

export { temporaryStorage };

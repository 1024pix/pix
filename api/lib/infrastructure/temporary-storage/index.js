import settings from '../../config';
const REDIS_URL = settings.temporaryStorage.redisUrl;

import InMemoryTemporaryStorage from './InMemoryTemporaryStorage';
import RedisTemporaryStorage from './RedisTemporaryStorage';

function _createTemporaryStorage() {
  if (REDIS_URL) {
    return new RedisTemporaryStorage(REDIS_URL);
  } else {
    return new InMemoryTemporaryStorage();
  }
}

export default _createTemporaryStorage();

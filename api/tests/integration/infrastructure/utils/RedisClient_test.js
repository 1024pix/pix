const RedisClient = require('../../../../lib/infrastructure/utils/RedisClient');
const { expect } = require('../../../test-helper');

describe('Integration | Infrastructure | Utils | RedisClient', function () {
  // this check is used to prevent failure when redis is not setup
  // eslint-disable-next-line mocha/no-setup-in-describe
  if (process.env.REDIS_TEST_URL !== undefined) {
    it('stores and retrieve a value for a key', async function () {
      // given
      const key = new Date().toISOString();
      const redisClient = new RedisClient(process.env.REDIS_TEST_URL);

      // when
      await redisClient.set(key, 'value');
      const value = await redisClient.get(key);

      // then
      expect(value).to.equal('value');
    });

    it('should separate storage for identical keys saved with different prefixes', async function () {
      // given
      const redisClient1 = new RedisClient(process.env.REDIS_URL, { prefix: 'test1' });
      const redisClient2 = new RedisClient(process.env.REDIS_URL, { prefix: 'test2' });
      await redisClient1.set('key', 'value1');
      await redisClient2.set('key', 'value2');

      // when / then
      expect(await redisClient1.get('key')).to.equal('value1');
      expect(await redisClient2.get('key')).to.equal('value2');
    });

    it('should allow retrieve without prefix a value with a prefix', async function () {
      // given
      const value = new Date().toISOString();
      const redisClientWithoutPrefix = new RedisClient(process.env.REDIS_URL);
      const redisClientWithPrefix = new RedisClient(process.env.REDIS_URL, { prefix: 'client-prefix:' });
      await redisClientWithoutPrefix.set('key', value);

      // when / then
      expect(await redisClientWithPrefix.get('storage-prefix:key')).to.equal(value);
    });
  }
});

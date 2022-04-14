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
      await redisClient.del(key);
    });

    it('should delete a value with prefix', async function () {
      // given
      const value = new Date().toISOString();
      const redisClientWithPrefix = new RedisClient(process.env.REDIS_URL, { prefix: 'client-prefix:' });
      await redisClientWithPrefix.set('AVRIL', value);

      // when
      await redisClientWithPrefix.del('AVRIL');

      // then
      expect(await redisClientWithPrefix.get('AVRIL')).to.be.null;
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
      await redisClient1.del('key');
      await redisClient2.del('key');
    });
  }
});

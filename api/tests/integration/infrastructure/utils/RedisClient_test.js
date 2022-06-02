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

    describe('#deleteByPrefix', function () {
      it('should delete keys with given matching prefix', async function () {
        // given
        const value = new Date().toISOString();
        const redisClient = new RedisClient(process.env.REDIS_URL, { prefix: 'client-prefix:' });
        await redisClient.set('123:AVRIL', value);
        await redisClient.set('123:abcde', value);
        await redisClient.set('456:abcde', value);

        // when
        await redisClient.deleteByPrefix('123:');

        // then
        expect(await redisClient.get('123:AVRIL')).to.not.exist;
        expect(await redisClient.get('123:abcde')).to.not.exist;
        expect(await redisClient.get('456:abcde')).to.exist;
      });

      it('should escape special characters', async function () {
        // given
        const value = new Date().toISOString();
        const redisClient = new RedisClient(process.env.REDIS_URL, { prefix: 'client-prefix:' });
        await redisClient.set('123:AVRIL', value);
        await redisClient.set('123:abcde', value);
        await redisClient.set('456:abcde', value);
        await redisClient.set('*:abcde', value);
        await redisClient.set('**:abcde', value);

        // when
        await redisClient.deleteByPrefix('**');

        // then
        expect(await redisClient.get('**:abcde')).to.not.exist;
        expect(await redisClient.get('*:abcde')).to.exist;
      });

      it('should do nothing if there is no matching prefix', async function () {
        // given
        const value = new Date().toISOString();
        const redisClient = new RedisClient(process.env.REDIS_URL, { prefix: 'client-prefix:' });
        await redisClient.set('789:abcde', value);

        // when
        await redisClient.deleteByPrefix('333:');

        // then
        expect(await redisClient.get('789:abcde')).to.exist;
      });
    });
  }
});

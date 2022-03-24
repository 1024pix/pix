const RedisClient = require('../../../../lib/infrastructure/utils/RedisClient');
const { expect } = require('../../../test-helper');

describe('Integration | Infrastructure | Utils | RedisClient', function () {
  it('stores and retrieve a value for a key', async function () {
    // given
    const key = new Date().toISOString();
    const redisClient = new RedisClient(process.env.REDIS_URL);

    // when
    redisClient.set(key, 'value');
    const value = await redisClient.get(key);

    // then
    expect(value).to.equal('value');
  });

  it('should separate storage for identical keys saved with different prefixes', async function () {
    // given
    const redisClient1 = new RedisClient(process.env.REDIS_URL, { prefix: 'test1' });
    const redisClient2 = new RedisClient(process.env.REDIS_URL, { prefix: 'test2' });
    redisClient1.set('key', 'value1');
    redisClient2.set('key', 'value2');

    // when / then
    expect(await redisClient1.get('key')).to.equal('value1');
    expect(await redisClient2.get('key')).to.equal('value2');
  });
});

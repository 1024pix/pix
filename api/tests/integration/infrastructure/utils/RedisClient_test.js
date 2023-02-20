import { v4 as uuidv4 } from 'uuid';
import RedisClient from '../../../../lib/infrastructure/utils/RedisClient';
import config from '../../../../lib/config';
import { expect } from '../../../test-helper';

describe('Integration | Infrastructure | Utils | RedisClient', function () {
  it('stores and retrieve a value for a key', async function () {
    // given
    const key = new Date().toISOString();
    const redisClient = new RedisClient(config.redis.url);

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
    const redisClientWithPrefix = new RedisClient(config.redis.url, { prefix: 'client-prefix:' });
    await redisClientWithPrefix.set('AVRIL', value);

    // when
    await redisClientWithPrefix.del('AVRIL');

    // then
    expect(await redisClientWithPrefix.get('AVRIL')).to.be.null;
  });

  it('should separate storage for identical keys saved with different prefixes', async function () {
    // given
    const redisClient1 = new RedisClient(config.redis.url, { prefix: 'test1' });
    const redisClient2 = new RedisClient(config.redis.url, { prefix: 'test2' });
    await redisClient1.set('key', 'value1');
    await redisClient2.set('key', 'value2');

    // when / then
    expect(await redisClient1.get('key')).to.equal('value1');
    expect(await redisClient2.get('key')).to.equal('value2');
    await redisClient1.del('key');
    await redisClient2.del('key');
  });

  it('should allow to handle a list of values for a key', async function () {
    // given
    const keyToAdd = uuidv4();
    const keyToRemove = uuidv4();
    const redisClient = new RedisClient(config.redis.url);

    await redisClient.lpush(keyToRemove, 'value1');
    await redisClient.lpush(keyToRemove, 'value2');

    // when
    const keyToAddLength = await redisClient.lpush(keyToAdd, 'value1');
    const keyToAddList = await redisClient.lrange(keyToAdd, 0, -1);

    const valuesRemovedLength = await redisClient.lrem(keyToRemove, 0, 'value1');
    const keyToRemoveList = await redisClient.lrange(keyToRemove, 0, -1);

    // then
    expect(keyToAddLength).to.equal(1);
    expect(keyToAddList).to.deep.equal(['value1']);

    expect(valuesRemovedLength).to.equal(1);
    expect(keyToRemoveList).to.deep.equal(['value2']);

    await redisClient.del(keyToAdd);
    await redisClient.del(keyToRemove);
  });
});

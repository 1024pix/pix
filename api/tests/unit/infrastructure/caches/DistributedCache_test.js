import { expect, sinon } from '../../../test-helper.js';
import { DistributedCache } from '../../../../lib/infrastructure/caches/DistributedCache.js';

describe('Unit | Infrastructure | Caches | DistributedCache', function () {
  let distributedCacheInstance;
  let underlyingCache;
  const channel = 'channel';

  beforeEach(function () {
    underlyingCache = {
      get: sinon.stub(),
      set: sinon.stub(),
      patch: sinon.stub(),
      flushAll: sinon.stub(),
    };
    const redisUrl = 'redis://url.example.net';
    distributedCacheInstance = new DistributedCache(underlyingCache, redisUrl, channel);
  });

  describe('#get', function () {
    it('should resolve the underlying cache result for get() method', async function () {
      // given
      const cacheKey = 'cache-key';
      const cachedObject = { foo: 'bar' };
      const generator = () => cachedObject;
      underlyingCache.get.withArgs(cacheKey, generator).resolves(cachedObject);

      // when
      const result = await distributedCacheInstance.get(cacheKey, generator);

      // then
      expect(result).to.deep.equal(cachedObject);
    });
  });

  describe('#set', function () {
    it('should resolve the underlying cache result for set() method', async function () {
      // given
      const cacheKey = 'cache-key';
      const objectToCache = { foo: 'bar' };
      underlyingCache.set.withArgs(cacheKey, objectToCache).resolves(objectToCache);

      // when
      const result = await distributedCacheInstance.set(cacheKey, objectToCache);

      // then
      expect(result).to.deep.equal(objectToCache);
    });
  });

  describe('#patch', function () {
    it('should publish the patch on the redis channel', async function () {
      // given
      distributedCacheInstance._redisClientPublisher = {
        publish: sinon.stub(),
      };
      const cacheKey = 'cache-key';
      const patch = {
        operation: 'assign',
        path: 'challenges[0]',
        value: { id: 'recChallenge1', instruction: 'Nouvelle consigne' },
      };

      const message = {
        patch,
        cacheKey,
        type: 'patch',
      };
      const messageAsString = JSON.stringify(message);
      distributedCacheInstance._redisClientPublisher.publish.withArgs(channel, messageAsString).resolves(true);

      // when
      await distributedCacheInstance.patch(cacheKey, patch);

      // then
      expect(distributedCacheInstance._redisClientPublisher.publish).to.have.been.calledOnceWith(
        channel,
        messageAsString,
      );
    });
  });

  describe('#flushAll', function () {
    it('shoud use Redis pub/sub notification mechanism to trigger the caches synchronization', async function () {
      // given
      distributedCacheInstance._redisClientPublisher = {
        publish: sinon.stub(),
      };
      const message = {
        type: 'flushAll',
      };
      distributedCacheInstance._redisClientPublisher.publish.withArgs(channel, JSON.stringify(message)).resolves(true);

      // when
      const result = await distributedCacheInstance.flushAll();

      // then
      expect(result).to.be.true;
    });
  });

  describe('receive message', function () {
    it('should flushAll when flush message is received', async function () {
      // given
      const message = {
        type: 'flushAll',
      };
      // when
      await distributedCacheInstance.clientSubscriberCallback('channel', JSON.stringify(message));

      // then
      expect(distributedCacheInstance._underlyingCache.flushAll).to.have.been.calledOnce;
    });

    it('should patch when patch message is received', async function () {
      // given
      const cacheKey = 'cache-key';
      const patch = {
        operation: 'assign',
        path: 'challenges[0]',
        value: { id: 'recChallenge1', instruction: 'Nouvelle consigne' },
      };

      const message = {
        type: 'patch',
        patch,
        cacheKey,
      };
      const messageAsString = JSON.stringify(message);

      // when
      await distributedCacheInstance.clientSubscriberCallback('channel', messageAsString);

      // then
      expect(distributedCacheInstance._underlyingCache.flushAll).not.to.have.been.called;
      expect(distributedCacheInstance._underlyingCache.patch).to.have.been.calledWith(cacheKey, patch);
    });
  });
});

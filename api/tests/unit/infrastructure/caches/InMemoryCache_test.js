import NodeCache from 'node-cache';
import { expect, sinon } from '../../../test-helper';
import InMemoryCache from '../../../../lib/infrastructure/caches/InMemoryCache';

describe('Unit | Infrastructure | Cache | in-memory-cache', function () {
  let inMemoryCache;

  const CACHE_KEY = 'cache_key';
  const NODE_CACHE_ERROR = new Error('A Node cache error');

  beforeEach(function () {
    inMemoryCache = new InMemoryCache();
  });

  describe('#constructor', function () {
    it('should create a NodeCache instance', function () {
      // then
      expect(inMemoryCache._cache).to.be.an.instanceOf(NodeCache);
    });
  });

  describe('#get', function () {
    it('should resolve with the previously cached value when it exists', async function () {
      // given
      const cachedObject = { foo: 'bar' };
      inMemoryCache._cache.set(CACHE_KEY, cachedObject);

      // when
      const result = await inMemoryCache.get(CACHE_KEY);

      // then
      expect(result).to.deep.equal(cachedObject);
    });

    it('should call generator when no object was previously cached for given key', async function () {
      // when
      const generatorStub = sinon.stub().resolves('hello');
      const result = await inMemoryCache.get(CACHE_KEY, generatorStub);

      // then
      expect(result).to.equal('hello');
    });

    it('should reject when generator fails', function () {
      // given
      const generatorError = new Error('Generator failed');
      const generatorStub = sinon.stub().rejects(generatorError);

      // when
      const promise = inMemoryCache.get(CACHE_KEY, generatorStub);

      // then
      return expect(promise).to.have.been.rejectedWith(generatorError);
    });

    it('should not call generator again if same key is requested while generator is in progress', async function () {
      // when
      const generatorStub = sinon.stub().resolves('hello');
      const generatorStub2 = sinon.stub().resolves('hello');
      const promise = inMemoryCache.get(CACHE_KEY, generatorStub);
      const promise2 = inMemoryCache.get(CACHE_KEY, generatorStub2);

      // then
      await Promise.all([promise, promise2]);
      expect(generatorStub2).to.not.have.been.called;
    });

    it('should not throw further get if one generator fails', async function () {
      // when
      const generatorError = new Error('Generator failed');
      const failingGenerator = sinon.stub().rejects(generatorError);
      const successfulGenerator = sinon.stub().resolves('hello');
      const promise = inMemoryCache.get(CACHE_KEY, failingGenerator);
      const promise2 = inMemoryCache.get(CACHE_KEY, successfulGenerator);

      // then
      await expect(promise).to.have.been.rejectedWith(generatorError);
      expect(await promise2).to.equal('hello');
    });

    it('should reject when the Node cache throws an error', function () {
      // given
      inMemoryCache._cache.get = () => {
        throw NODE_CACHE_ERROR;
      };

      // when
      const promise = inMemoryCache.get(CACHE_KEY);

      // then
      return expect(promise).to.have.been.rejectedWith(NODE_CACHE_ERROR);
    });
  });

  describe('#set', function () {
    const objectToCache = { foo: 'bar' };

    it('should resolve with the object to cache', async function () {
      // when
      const result = await inMemoryCache.set(CACHE_KEY, objectToCache);

      // then
      expect(result).to.deep.equal(objectToCache);
      expect(inMemoryCache._cache.get(CACHE_KEY)).to.equal(objectToCache);
    });

    it('should reject when the Node cache throws an error', function () {
      // given
      inMemoryCache._cache.set = () => {
        throw NODE_CACHE_ERROR;
      };

      // when
      const promise = inMemoryCache.set(CACHE_KEY, objectToCache);

      // then
      return expect(promise).to.have.been.rejectedWith(NODE_CACHE_ERROR);
    });
  });

  describe('#flushAll', function () {
    it('should resolve', async function () {
      // given
      await inMemoryCache.set('foo', 'bar');

      // when
      await inMemoryCache.flushAll();

      // then
      expect(inMemoryCache._cache.getStats().keys).to.equal(0);
    });
  });
});

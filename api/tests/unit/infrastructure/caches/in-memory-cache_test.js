const { expect, sinon } = require('../../../test-helper');
const NodeCache = require('node-cache');
const InMemoryCache = require('../../../../lib/infrastructure/caches/in-memory-cache');

describe('Unit | Infrastructure | Cache | in-memory-cache', () => {

  let cache;
  let inMemoryCache;

  const CACHE_KEY = 'cache_key';
  const NODE_CACHE_ERROR = new Error('A Node cache error');

  beforeEach(() => {
    cache = {};
    inMemoryCache = new InMemoryCache();
    inMemoryCache._cache = cache;
  });

  describe('#constructor', () => {

    it('should create a NodeCache instance', () => {
      // when
      const inMemoryCache = new InMemoryCache();

      // then
      expect(inMemoryCache._cache).to.be.an.instanceOf(NodeCache);
    });
  });

  describe('#get', () => {

    beforeEach(() => {
      cache.get = sinon.stub();
      cache.set = sinon.stub();
    });

    it('should resolve with the previously cached value when it exists', () => {
      // given
      const cachedObject = { foo: 'bar' };
      cache.get.returns(cachedObject);

      // when
      const promise = inMemoryCache.get(CACHE_KEY);

      // then
      return expect(promise).to.have.been.fulfilled
        .then((result) => {
          expect(result).to.deep.equal(cachedObject);
          expect(cache.get).to.have.been.calledWith(CACHE_KEY);
        });
    });

    it('should call generator when no object was previously cached for given key', () => {
      // given
      const noCachedObject = null;
      cache.get.returns(noCachedObject);
      cache.set.returns(true);

      // when
      const generatorStub = sinon.stub().resolves('hello');
      const promise = inMemoryCache.get(CACHE_KEY, generatorStub);

      // then
      return expect(promise).to.have.been.fulfilled
        .then((result) => {
          expect(result).to.equal('hello');
        });
    });

    it('should reject when the Node cache throws an error', () => {
      // given
      cache.get.throws(NODE_CACHE_ERROR);

      // when
      const promise = inMemoryCache.get(CACHE_KEY);

      // then
      return expect(promise).to.have.been.rejectedWith(NODE_CACHE_ERROR);
    });
  });

  describe('#set', () => {

    const objectToCache = { foo: 'bar' };

    beforeEach(() => {
      cache.set = sinon.stub();
    });

    it('should resolve with the object to cache', () => {
      // given
      const SUCCESS = true;
      cache.set.returns(SUCCESS);

      // when
      const promise = inMemoryCache.set(CACHE_KEY, objectToCache);

      // then
      return expect(promise).to.have.been.fulfilled
        .then((result) => {
          expect(result).to.deep.equal(objectToCache);
          expect(cache.set).to.have.been.calledWith(CACHE_KEY, objectToCache);
        });
    });

    it('should reject when the Node cache throws an error', () => {
      // given
      cache.set.throws(NODE_CACHE_ERROR);

      // when
      const promise = inMemoryCache.set(CACHE_KEY, objectToCache);

      // then
      return expect(promise).to.have.been.rejectedWith(NODE_CACHE_ERROR);
    });
  });

  describe('#flushAll', () => {

    beforeEach(() => {
      cache.flushAll = sinon.stub();
    });

    it('should resolve', () => {
      // when
      const promise = inMemoryCache.flushAll();

      // then
      return expect(promise).to.have.been.fulfilled
        .then(() => {
          expect(cache.flushAll).to.have.been.called;
        });
    });
  });

});

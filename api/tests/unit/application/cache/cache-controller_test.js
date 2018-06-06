const { expect, sinon } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const cache = require('../../../../lib/infrastructure/caches/cache');
const CacheController = require('../../../../lib/application/cache/cache-controller');

describe('Unit | Controller | CacheController', () => {

  const replyStub = sinon.stub();
  const codeSpy = sinon.spy();

  beforeEach(() => {
    replyStub.returns({
      code: codeSpy
    });
  });

  afterEach(() => {
    replyStub.reset();
    codeSpy.resetHistory();
  });

  describe('#removeCacheEntry', () => {
    const request = {
      params: {
        cachekey: 'test-cache-key'
      }
    };

    beforeEach(() => {
      sinon.stub(usecases, 'removeCacheEntry');
    });

    afterEach(() => {
      usecases.removeCacheEntry.restore();
    });

    context('when the cache key exists', () => {

      it('should reply with success', () => {
        // given
        const cacheKey = request.params.cachekey;
        const numberOfDeletedKeys = 1;
        usecases.removeCacheEntry.resolves(numberOfDeletedKeys);

        // when
        const promise = CacheController.removeCacheEntry(request, replyStub);

        // Then
        return expect(promise).to.have.been.fulfilled
          .then(() => {
            expect(usecases.removeCacheEntry).to.have.been.calledWith({ cacheKey, cache });
            expect(replyStub).to.have.been.calledWith('Entry successfully deleted');
            expect(codeSpy).to.have.been.calledWith(200);
          });
      });
    });

    context('when the cache key does not exist', () => {

      it('should reply with not found', () => {
        // given
        const numberOfDeletedKeys = 0;
        usecases.removeCacheEntry.resolves(numberOfDeletedKeys);

        // when
        const promise = CacheController.removeCacheEntry(request, replyStub);

        // Then
        return expect(promise).to.have.been.fulfilled
          .then(() => {
            expect(replyStub).to.have.been.calledWith('Entry not found');
            expect(codeSpy).to.have.been.calledWith(404);
          });
      });
    });

    context('when cache deletion fails', () => {

      it('should reply with error', () => {
        // given
        const cacheError = new Error('Cache Error');
        usecases.removeCacheEntry.rejects(cacheError);

        // when
        const promise = CacheController.removeCacheEntry(request, replyStub);

        // Then
        return expect(promise).to.have.been.fulfilled
          .then(() => {
            expect(replyStub).to.have.been.calledWith(cacheError);
            expect(codeSpy).to.have.been.calledWith(500);
          });
      });
    });

  });

  describe('#removeAllCacheEntries', () => {
    const request = {};

    beforeEach(() => {
      sinon.stub(usecases, 'removeAllCacheEntries');
    });

    afterEach(() => {
      usecases.removeAllCacheEntries.restore();
    });

    context('when cache deletion succeed', () => {

      it('should reply with success', () => {
        // given
        usecases.removeAllCacheEntries.resolves();

        // when
        const promise = CacheController.removeAllCacheEntries(request, replyStub);

        // Then
        return expect(promise).to.have.been.fulfilled
          .then(() => {
            expect(usecases.removeAllCacheEntries).to.have.been.calledWith({ cache });
            expect(replyStub).to.have.been.calledWith('Entries successfully deleted');
            expect(codeSpy).to.have.been.calledWith(200);
          });
      });
    });

    context('when cache deletion fails', () => {

      it('should reply with server error', () => {
        // given
        const cacheError = new Error('Cache Error');
        usecases.removeAllCacheEntries.rejects(cacheError);

        // when
        const promise = CacheController.removeAllCacheEntries(request, replyStub);

        // Then
        return expect(promise).to.have.been.fulfilled
          .then(() => {
            expect(replyStub).to.have.been.calledWith(cacheError);
            expect(codeSpy).to.have.been.calledWith(500);
          });
      });
    });

  });
});

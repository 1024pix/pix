const { expect, sinon } = require('../../../test-helper');
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
      sinon.stub(cache, 'del');
    });

    afterEach(() => {
      cache.del.restore();
    });

    context('when cache deletion succeed', () => {

      it('should reply with success', () => {
        // given
        cache.del.resolves();

        // when
        const promise = CacheController.removeCacheEntry(request, replyStub);

        // Then
        return expect(promise).to.have.been.fulfilled
          .then(() => {
            expect(replyStub).to.have.been.calledWith('Entry successfully deleted');
            expect(codeSpy).to.have.been.calledWith(200);
          });
      });
    });

    context('when cache deletion fails', () => {

      it('should reply with error', () => {
        // given
        cache.del.rejects();

        // when
        const promise = CacheController.removeCacheEntry(request, replyStub);

        // Then
        return expect(promise).to.have.been.fulfilled
          .then(() => {
            expect(replyStub).to.have.been.calledWith('Entry key is not found');
            expect(codeSpy).to.have.been.calledWith(404);
          });
      });
    });

  });

  describe('#removeAllCacheEntries', () => {
    const request = {};

    beforeEach(() => {
      sinon.stub(cache, 'flushAll');
    });

    afterEach(() => {
      cache.flushAll.restore();
    });

    context('when cache deletion succeed', () => {

      it('should reply with success', () => {
        // given
        cache.flushAll.resolves();

        // when
        const promise = CacheController.removeAllCacheEntries(request, replyStub);

        // Then
        return expect(promise).to.have.been.fulfilled
          .then(() => {
            expect(replyStub).to.have.been.calledWith('Entries successfully deleted');
            expect(codeSpy).to.have.been.calledWith(200);
          });
      });
    });

    context('when cache deletion fails', () => {

      it('should reply with server error', () => {
        // given
        cache.flushAll.rejects();

        // when
        const promise = CacheController.removeAllCacheEntries(request, replyStub);

        // Then
        return expect(promise).to.have.been.fulfilled
          .then(() => {
            expect(replyStub).to.have.been.calledWith('Something went wrong');
            expect(codeSpy).to.have.been.calledWith(500);
          });
      });
    });

  });
});

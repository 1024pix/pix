const { expect, sinon } = require('../../../test-helper');
const cache = require('../../../../lib/infrastructure/cache');
const CacheController = require('../../../../lib/application/cache/cache-controller');

describe('Unit | Controller | CacheController', () => {

  describe('#removeCacheEntry', () => {
    const request = {
      headers: { authorization: 'INVALID_TOKEN' },
      payload: {
        'cache-key': 'test-cache-key'
      }
    };

    const replyStub = sinon.stub();
    const codeSpy = sinon.spy();

    beforeEach(() => {
      sinon.stub(cache, 'del');
      replyStub.returns({
        code: codeSpy
      });
    });

    afterEach(() => {
      cache.del.restore();
      replyStub.reset();
    });

    it('should call reply', () => {
      // when
      CacheController.removeCacheEntry(request, replyStub);
      // Then
      sinon.assert.calledOnce(replyStub);
    });

    describe('Success cases', () => {

      it('should delete cache entry with key provided', () => {
        // Given
        const countOfDeletedEntries = 1;
        cache.del.returns(countOfDeletedEntries);
        // When
        CacheController.removeCacheEntry(request, replyStub);

        // Then
        sinon.assert.calledWith(codeSpy, 200);
        sinon.assert.calledWith(cache.del, 'test-cache-key');
        expect(replyStub.getCall(0).args[0]).to.be.equal('Entry successfully deleted');
      });

    });

    describe('Error cases', () => {

      it('should reply with Error, when cache key is not found', () => {
        // Given
        const noDeletedEntries = 0;
        cache.del.returns(noDeletedEntries);

        // When
        CacheController.removeCacheEntry(request, replyStub);

        // The
        expect(replyStub.getCall(0).args[0]).to.be.equal('Entry key is not found');
        sinon.assert.calledWith(codeSpy, 404);
      });
    });

  });
});

const { expect } = require('../../../test-helper');
const Cache = require('../../../../lib/infrastructure/caches/Cache');

describe('Unit | Infrastructure | Caches | Cache', () => {

  const cacheInstance = new Cache();

  describe('#get', () => {

    it('should reject an error (because this class actually mocks an interface)', () => {
      // when
      const result = cacheInstance.get('some-key', () => {});

      // then
      expect(result).to.be.rejected;
    });
  });

  describe('#set', () => {

    it('should reject an error (because this class actually mocks an interface)', () => {
      // when
      const result = cacheInstance.set('some-key', {});

      // then
      expect(result).to.be.rejected;
    });
  });

  describe('#flushAll', () => {

    it('should reject an error (because this class actually mocks an interface)', () => {
      // when
      const result = cacheInstance.flushAll();

      // then
      expect(result).to.be.rejected;
    });
  });
});

import { expect } from '../../../test-helper';
import Cache from '../../../../lib/infrastructure/caches/Cache';

describe('Unit | Infrastructure | Caches | Cache', function () {
  const cacheInstance = new Cache();

  describe('#get', function () {
    it('should reject an error (because this class actually mocks an interface)', function () {
      // when
      const result = cacheInstance.get('some-key', () => {
        return;
      });

      // then
      expect(result).to.be.rejected;
    });
  });

  describe('#set', function () {
    it('should reject an error (because this class actually mocks an interface)', function () {
      // when
      const result = cacheInstance.set('some-key', {});

      // then
      expect(result).to.be.rejected;
    });
  });

  describe('#flushAll', function () {
    it('should reject an error (because this class actually mocks an interface)', function () {
      // when
      const result = cacheInstance.flushAll();

      // then
      expect(result).to.be.rejected;
    });
  });
});

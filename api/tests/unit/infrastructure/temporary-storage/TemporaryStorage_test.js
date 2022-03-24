const { expect } = require('../../../test-helper');
const TemporaryStorage = require('../../../../lib/infrastructure/temporary-storage/TemporaryStorage');

describe('Unit | Infrastructure | temporary-storage | TemporaryStorage', function () {
  describe('#save', function () {
    it('should reject an error (because this class actually mocks an interface)', function () {
      // given
      const temporaryStorageInstance = new TemporaryStorage();

      // when
      const result = temporaryStorageInstance.save({ value: {}, expirationDelaySeconds: 1000 });

      // then
      expect(result).to.be.rejected;
    });
  });

  describe('#get', function () {
    it('should reject an error (because this class actually mocks an interface)', function () {
      // given
      const temporaryStorageInstance = new TemporaryStorage();

      // when
      const result = temporaryStorageInstance.get('key');

      // then
      expect(result).to.be.rejected;
    });
  });

  describe('#delete', function () {
    it('should reject an error (because this class actually mocks an interface)', function () {
      // given
      const temporaryStorageInstance = new TemporaryStorage();

      // when
      const result = temporaryStorageInstance.delete('key');

      // then
      expect(result).to.be.rejected;
    });
  });

  describe('#generateKey', function () {
    it('should return a key from static method', function () {
      // when
      const result = TemporaryStorage.generateKey();

      // then
      expect(result).to.be.ok;
    });
  });
});

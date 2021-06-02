const { expect } = require('../../../test-helper');
const TemporaryStorage = require('../../../../lib/infrastructure/temporary-storage/TemporaryStorage');

describe('Unit | Infrastructure | temporary-storage | TemporaryStorage', () => {

  describe('#save', () => {

    it('should reject an error (because this class actually mocks an interface)', () => {
      // given
      const temporaryStorageInstance = new TemporaryStorage();

      // when
      const result = temporaryStorageInstance.save({ value: {}, expirationDelaySeconds: 1000 });

      // then
      expect(result).to.be.rejected;
    });
  });

  describe('#get', () => {

    it('should reject an error (because this class actually mocks an interface)', () => {
      // given
      const temporaryStorageInstance = new TemporaryStorage();

      // when
      const result = temporaryStorageInstance.get('key');

      // then
      expect(result).to.be.rejected;
    });
  });

});

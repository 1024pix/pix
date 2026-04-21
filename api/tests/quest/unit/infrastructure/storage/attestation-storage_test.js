import { AttestationStorage } from '../../../../../src/quest/infrastructure/storage/attestation-storage.js';

describe('Unit | Storage | AttestationStorage', function () {
  describe('#createClient', function () {
    it('should create a S3 Client', function () {
      // given & when
      const client = AttestationStorage.createClient();

      // then
      expect(client).to.be.instanceOf(AttestationStorage);
    });
  });
});

import { RevokedUserAccess } from '../../../../../src/identity-access-management/domain/models/RevokedUserAccess.js';
import { revokedUserAccessRepository } from '../../../../../src/identity-access-management/infrastructure/repositories/revoked-user-access.repository.js';
import { temporaryStorage } from '../../../../../src/shared/infrastructure/key-value-storages/index.js';

const revokedUserAccessTemporaryStorage = temporaryStorage.withPrefix('revoked-user-access:');

describe('Integration | Identity Access Management | Infrastructure | Repository | revoked-user', function () {
  beforeEach(async function () {
    await revokedUserAccessTemporaryStorage.flushAll();
  });

  describe('#saveForUser', function () {
    it('saves revoked user access in Redis', async function () {
      // given
      const revokeUntil = new Date();
      const revokedTimeStamp = Math.floor(revokeUntil.getTime() / 1000);

      // when
      await revokedUserAccessRepository.saveForUser({ userId: 12345, revokeUntil });

      // then
      const result = await revokedUserAccessTemporaryStorage.get(12345);
      expect(result).to.equal(revokedTimeStamp);
    });
  });

  describe('#findByUserId', function () {
    it('finds revoked user access by user id', async function () {
      // given
      const revokeUntil = new Date();
      const revokeTimeStamp = Math.floor(new Date().getTime() / 1000);
      await revokedUserAccessRepository.saveForUser({ userId: 12345, revokeUntil });

      // when
      const result = await revokedUserAccessRepository.findByUserId(12345);

      // then
      expect(result).to.deep.equal({
        revokeTimeStamp: revokeTimeStamp,
      });
      expect(result).to.be.instanceOf(RevokedUserAccess);
    });
  });
});

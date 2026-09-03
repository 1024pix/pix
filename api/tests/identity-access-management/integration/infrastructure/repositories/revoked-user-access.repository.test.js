import { setImmediate } from 'node:timers/promises';

import { expect } from 'chai';

import { RevokedUserAccess } from '../../../../../src/identity-access-management/domain/models/RevokedUserAccess.js';
import { revokedUserAccessRepository } from '../../../../../src/identity-access-management/infrastructure/repositories/revoked-user-access.repository.js';
import { featureToggles } from '../../../../../src/shared/infrastructure/feature-toggles/index.js';
import { temporaryStorage } from '../../../../../src/shared/infrastructure/key-value-storages/index.js';

const revokedUserAccessTemporaryStorage = temporaryStorage.withPrefix('revoked-user-access:');

describe('Integration | Identity Access Management | Infrastructure | Repository | revoked-user', function () {
  beforeEach(async function () {
    await revokedUserAccessTemporaryStorage.flushAll();
  });

  describe('#revokeAll', function () {
    it('saves revoked user access in TemporaryStorage', async function () {
      // given
      const revokeUntil = new Date();
      const revokedTimeStamp = Math.floor(revokeUntil.getTime() / 1000);

      // when
      await revokedUserAccessRepository.revokeAll({ userId: 12345, revokeUntil });

      // then
      const legacyResult = await revokedUserAccessTemporaryStorage.get(12345);
      expect(legacyResult).to.equal(revokedTimeStamp);

      const result = await revokedUserAccessTemporaryStorage.get('12345:all');
      expect(result).to.equal(revokedTimeStamp);
    });
  });

  describe('#revokeSession', function () {
    it('saves revoked access for user session in TemporaryStorage', async function () {
      // given
      const revokeUntil = new Date();
      const revokedTimeStamp = Math.floor(revokeUntil.getTime() / 1000);

      // when
      await revokedUserAccessRepository.revokeSession({ userId: 12345, sessionId: 67890, revokeUntil });

      // then
      const result = await revokedUserAccessTemporaryStorage.get('12345:67890');
      expect(result).to.equal(revokedTimeStamp);
    });
  });

  describe('#findByUserId', function () {
    it('finds revoked user access by user id', async function () {
      // given
      const revokedAllTimeStamp = Math.floor(new Date().getTime() / 1000);
      await revokedUserAccessTemporaryStorage.save({ key: 12345, value: revokedAllTimeStamp });

      // when
      const result = await revokedUserAccessRepository.findByUserId(12345);

      // then
      expect(result).to.deep.equal({
        revokedAllTimeStamp,
        revokedSessions: undefined,
      });
      expect(result).to.be.instanceOf(RevokedUserAccess);
    });

    describe('when isSessionLogoutEnabled FT is true', function () {
      beforeEach(async function () {
        await featureToggles.set('isSessionLogoutEnabled', true);
        await setImmediate();
      });

      it('finds revoked user access by user id', async function () {
        // given
        const revokedAllTimeStamp = Math.floor(new Date('2026-08-27T15:00:50Z').getTime() / 1000);
        await revokedUserAccessTemporaryStorage.save({ key: '12345:all', value: revokedAllTimeStamp });

        const session1RevokedTimestamp = Math.floor(new Date().getTime('2026-08-27T16:00:50Z') / 1000);
        await revokedUserAccessTemporaryStorage.save({ key: '12345:session1', value: session1RevokedTimestamp });

        const session2RevokedTimestamp = Math.floor(new Date().getTime('2026-08-27T17:00:50Z') / 1000);
        await revokedUserAccessTemporaryStorage.save({ key: '12345:session2', value: session2RevokedTimestamp });

        // when
        const result = await revokedUserAccessRepository.findByUserId(12345);

        // then
        expect(result).to.deep.equal({
          revokedAllTimeStamp,
          revokedSessions: ['session1', 'session2'],
        });
        expect(result).to.be.instanceOf(RevokedUserAccess);
      });
    });
  });
});

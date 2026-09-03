import { setImmediate } from 'node:timers/promises';

import { expect } from 'chai';

import { RevokedUserAccess } from '../../../../../src/identity-access-management/domain/models/RevokedUserAccess.js';
import { revokedUserAccessRepository } from '../../../../../src/identity-access-management/infrastructure/repositories/revoked-user-access.repository.js';
import { config } from '../../../../../src/shared/config.js';
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
      const sessionId = crypto.randomUUID();

      // when
      await revokedUserAccessRepository.revokeSession({ userId: 12345, sessionId });

      // then
      const result = await revokedUserAccessTemporaryStorage.smembers('12345:sessions');
      expect(result).to.deep.equal([sessionId]);
      const ttl = await revokedUserAccessTemporaryStorage.ttl('12345:sessions');
      expect(ttl).to.equal(config.authentication.revokedUserAccessLifespanMs / 1000);
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

        await revokedUserAccessTemporaryStorage.sadd({ key: '12345:sessions', value: 'session1' });
        await revokedUserAccessTemporaryStorage.sadd({ key: '12345:sessions', value: 'session2' });

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

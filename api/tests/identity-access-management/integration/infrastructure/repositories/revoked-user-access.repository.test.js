import { setImmediate } from 'node:timers/promises';

import { expect } from 'chai';
import sinon from 'sinon';

import { config } from '../../../../../config/config.js';
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
    const now = 1793024598070;

    beforeEach(function () {
      sinon.useFakeTimers({ now, toFake: ['Date'] });
    });

    it('creates revoked sessions hash in temporary TemporaryStorage', async function () {
      // given
      const sessionId = crypto.randomUUID();

      // when
      await revokedUserAccessRepository.revokeSession({ userId: 12345, sessionId });

      // then
      const result = await revokedUserAccessTemporaryStorage.hgetall('12345:sessions');
      expect(result).to.deep.equal({ [sessionId]: now + config.authentication.revokedUserAccessLifespanMs });
      const ttl = await revokedUserAccessTemporaryStorage.ttl('12345:sessions');
      expect(ttl).to.equal(config.authentication.revokedUserAccessLifespanMs / 1000);
    });

    describe('when user already has some expired sessions', function () {
      it('updates revoked sessions hash in TemporaryStorage', async function () {
        // given
        await revokedUserAccessTemporaryStorage.hset(
          '12345:sessions',
          '7f397a41-040d-4c15-8258-221b99989c06',
          now - 2000,
        );
        await revokedUserAccessTemporaryStorage.hset(
          '12345:sessions',
          '9b1fe207-cd55-4c68-9eb6-c49041a3b100',
          now + 5000,
        );
        await revokedUserAccessTemporaryStorage.hset(
          '12345:sessions',
          '3208ff68-32f7-4ead-ac6b-52bcfd8c436a',
          now + 10000,
        );
        await revokedUserAccessTemporaryStorage.expire({ key: '12345:sessions', expirationDelaySeconds: 10 });

        const sessionId = 'fb61df15-76b9-4928-9021-f24638642395';

        // when
        await revokedUserAccessRepository.revokeSession({ userId: 12345, sessionId });

        // then
        const result = await revokedUserAccessTemporaryStorage.hgetall('12345:sessions');
        expect(result).to.deep.equal({
          '9b1fe207-cd55-4c68-9eb6-c49041a3b100': now + 5000,
          '3208ff68-32f7-4ead-ac6b-52bcfd8c436a': now + 10000,
          'fb61df15-76b9-4928-9021-f24638642395': now + config.authentication.revokedUserAccessLifespanMs,
        });
        const ttl = await revokedUserAccessTemporaryStorage.ttl('12345:sessions');
        expect(ttl).to.equal(config.authentication.revokedUserAccessLifespanMs / 1000);
      });
    });
  });

  describe('#findByUserId', function () {
    const now = 1793024598070;

    it('finds revoked user access by user id', async function () {
      // given
      const revokedAllTimeStamp = Math.floor(new Date().getTime() / 1000);
      await revokedUserAccessTemporaryStorage.save({ key: 12345, value: revokedAllTimeStamp });

      // when
      const result = await revokedUserAccessRepository.findByUserId(12345);

      // then
      expect(result).to.deep.equal({
        revokedAllTimeStamp,
        revokedSessionIds: undefined,
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

        await revokedUserAccessTemporaryStorage.hset(
          '12345:sessions',
          '7f397a41-040d-4c15-8258-221b99989c06',
          now - 2000,
        );
        await revokedUserAccessTemporaryStorage.hset(
          '12345:sessions',
          '9b1fe207-cd55-4c68-9eb6-c49041a3b100',
          now + 5000,
        );
        await revokedUserAccessTemporaryStorage.hset(
          '12345:sessions',
          '3208ff68-32f7-4ead-ac6b-52bcfd8c436a',
          now + 10000,
        );

        // when
        const result = await revokedUserAccessRepository.findByUserId(12345);

        // then
        const sortedResult = { ...result, revokedSessionIds: result.revokedSessionIds.toSorted() };
        expect(sortedResult).to.deep.equal({
          revokedAllTimeStamp,
          revokedSessionIds: [
            '3208ff68-32f7-4ead-ac6b-52bcfd8c436a',
            '7f397a41-040d-4c15-8258-221b99989c06',
            '9b1fe207-cd55-4c68-9eb6-c49041a3b100',
          ],
        });
        expect(result).to.be.instanceOf(RevokedUserAccess);
      });
    });
  });
});

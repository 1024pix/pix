import sinon from 'sinon';

import { UserLogin } from '../../../../../src/identity-access-management/domain/models/UserLogin.js';
import * as userLoginRepository from '../../../../../src/identity-access-management/infrastructure/repositories/user-login-repository.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

const USER_LOGINS_TABLE_NAME = 'user-logins';

describe('Integration | Shared | Infrastructure | Repositories | UserLoginRepository', function () {
  describe('#findByUserId', function () {
    it('should return the found user-login', async function () {
      // given
      const userLogin = databaseBuilder.factory.buildUserLogin({
        id: 1,
      });
      await databaseBuilder.commit();

      // when
      const result = await userLoginRepository.findByUserId(userLogin.userId);

      // then
      expect(result).to.be.an.instanceOf(UserLogin);
      expect(result.id).to.equal(1);
    });

    it('should return null if no user is found', async function () {
      // given
      const nonExistentUserId = 678;

      // when
      const result = await userLoginRepository.findByUserId(nonExistentUserId);

      // then
      expect(result).to.be.null;
    });
  });

  describe('#getByUserId', function () {
    it('returns the found user-login', async function () {
      // given
      const userLogin = databaseBuilder.factory.buildUserLogin({
        id: 1,
      });
      await databaseBuilder.commit();

      // when
      const result = await userLoginRepository.getByUserId(userLogin.userId);

      // then
      expect(result).to.be.an.instanceOf(UserLogin);
      expect(result.id).to.equal(1);
    });

    it('throws NotFoundError if no user is found', async function () {
      // given
      const nonExistentUserId = 678;

      // when
      const result = await catchErr(userLoginRepository.getByUserId)(nonExistentUserId);

      // then
      expect(result).to.be.instanceOf(NotFoundError);
    });
  });

  describe('#create', function () {
    it('should return the created user-login', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const userLogin = new UserLogin({ userId });
      await databaseBuilder.commit();

      // when
      const result = await userLoginRepository.create(userLogin);

      // then
      expect(result).to.be.an.instanceOf(UserLogin);
      expect(result.userId).to.equal(userId);
      expect(result.createdAt).to.be.not.null;
      expect(result.updatedAt).to.be.not.null;
      expect(result.failureCount).to.equal(0);
    });
  });

  describe('#update', function () {
    let clock;
    const now = new Date('2022-11-24');

    beforeEach(async function () {
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    });

    afterEach(function () {
      clock.restore();
    });

    it('returns the updated user-login', async function () {
      // given
      const temporaryBlockedUntil = new Date('2022-10-10');
      databaseBuilder.factory.buildUserLogin();
      const userLoginInDB = databaseBuilder.factory.buildUserLogin();
      const userLoginToUpdate = new UserLogin({
        id: userLoginInDB.id,
        userId: userLoginInDB.userId,
        failureCount: 10,
        temporaryBlockedUntil,
        updatedAt: '2022-10-10',
      });
      await databaseBuilder.commit();

      // when
      const result = await userLoginRepository.update(userLoginToUpdate);

      // then
      expect(result).to.be.an.instanceOf(UserLogin);
      expect(result).to.deep.equal({
        id: userLoginInDB.id,
        userId: userLoginInDB.userId,
        failureCount: 10,
        temporaryBlockedUntil,
        blockedAt: null,
        createdAt: userLoginInDB.createdAt,
        updatedAt: now,
        lastLoggedAt: null,
      });
    });

    describe('when the preventUpdatedAt option is true', function () {
      it('does not change updatedAt on the updated user login', async function () {
        // given
        databaseBuilder.factory.buildUserLogin();
        const userLoginInDB = databaseBuilder.factory.buildUserLogin();
        const userLoginToUpdate = new UserLogin({ id: userLoginInDB.id, updatedAt: '2022-10-10' });
        await databaseBuilder.commit();

        // when
        const result = await userLoginRepository.update(userLoginToUpdate, { preventUpdatedAt: true });

        // then
        expect(result.updatedAt).to.deep.equal(new Date('2022-10-10'));
      });
    });
  });

  describe('#findByUsername', function () {
    it('should return the found user-login by email', async function () {
      // given
      databaseBuilder.factory.buildUser({ email: 'otherUser@example.net' });
      const userId = databaseBuilder.factory.buildUser({ email: 'pouet@example.net' }).id;
      const userLogin = databaseBuilder.factory.buildUserLogin({ userId });
      await databaseBuilder.commit();

      // when
      const result = await userLoginRepository.findByUsername('POUET@example.net');

      // then
      expect(result).to.be.an.instanceOf(UserLogin);
      expect(result.id).to.equal(userLogin.id);
    });

    it('should return the found user-login by username', async function () {
      // given
      databaseBuilder.factory.buildUser({ username: 'edward123' });
      const userId = databaseBuilder.factory.buildUser({ username: 'winry123' }).id;
      const userLogin = databaseBuilder.factory.buildUserLogin({ userId });
      await databaseBuilder.commit();

      // when
      const result = await userLoginRepository.findByUsername('WINry123');

      // then
      expect(result).to.be.an.instanceOf(UserLogin);
      expect(result.id).to.equal(userLogin.id);
    });

    it('should return null if no user is found', async function () {
      // given
      const nonExistentUsername = 'nonExisting@example.net';

      // when
      const result = await userLoginRepository.findByUsername(nonExistentUsername);

      // then
      expect(result).to.be.null;
    });
  });

  describe('#updateLastLoggedAt', function () {
    let clock;
    const now = new Date('2020-01-02');

    beforeEach(function () {
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    });

    afterEach(async function () {
      clock.restore();
    });

    context('when a user-login exists for given user id', function () {
      it('updates lastLoggedAt column to "now" ', async function () {
        // given
        const lastLoggedAt = new Date();
        const { userId } = databaseBuilder.factory.buildUserLogin({ lastLoggedAt });
        await databaseBuilder.commit();

        // when
        await userLoginRepository.updateLastLoggedAt({ userId });

        // then
        const userLoginsUpdated = await knex(USER_LOGINS_TABLE_NAME).select().where({ userId }).first();
        expect(userLoginsUpdated.lastLoggedAt).to.deep.equal(now);
      });
    });

    context('when a user-login does not exist for given user id', function () {
      it('inserts a new line and set lastLoggedAt to now', async function () {
        // given
        const { id: userId } = databaseBuilder.factory.buildUser();
        await databaseBuilder.commit();

        // when
        await userLoginRepository.updateLastLoggedAt({ userId });

        // then
        const userLoginsUpdated = await knex(USER_LOGINS_TABLE_NAME).select().where({ userId }).first();
        expect(userLoginsUpdated.lastLoggedAt).to.deep.equal(now);
      });
    });
  });

  describe('#batchUnblock', function () {
    let clock;
    const now = new Date('2025-05-05');

    beforeEach(function () {
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    });

    afterEach(async function () {
      clock.restore();
    });

    it('resets account blocking for the given accounts', async function () {
      // given
      const nonBlockedUserId = databaseBuilder.factory.buildUserLogin().userId;
      const temporarilyBlockedUserId = databaseBuilder.factory.buildUserLogin({
        failureCount: 50,
        temporaryBlockedUntil: new Date(Date.now() + 12 * 31 * 24 * 3600 * 1000), // 1 year into the future
      }).userId;
      const blockedUserId = databaseBuilder.factory.buildUserLogin({
        failureCount: 200,
        blockedAt: now,
      }).userId;

      const aNotToTouchBlockedUserId = databaseBuilder.factory.buildUserLogin({
        failureCount: 500,
        blockedAt: new Date('2020-01-01'),
        updatedAt: new Date('2020-01-01'),
      }).userId;

      await databaseBuilder.commit();

      const userIdsToBatchUnblock = [nonBlockedUserId, temporarilyBlockedUserId, blockedUserId];
      const allUserIds = userIdsToBatchUnblock.concat(aNotToTouchBlockedUserId);

      // when
      await userLoginRepository.batchUnblock(userIdsToBatchUnblock);

      // then
      const allUserLogins = await knex(USER_LOGINS_TABLE_NAME).select().whereIn('userId', allUserIds);

      const nonBlockedUserLogin = allUserLogins.find((userLogin) => {
        return userLogin.userId == nonBlockedUserId;
      });
      expect(nonBlockedUserLogin).to.deep.contain({
        failureCount: 0,
        temporaryBlockedUntil: null,
        blockedAt: null,
        updatedAt: now,
      });

      const temporarilyBlockedUserLogin = allUserLogins.find(
        (userLogin) => userLogin.userId == temporarilyBlockedUserId,
      );
      expect(temporarilyBlockedUserLogin).to.deep.contain({
        failureCount: 0,
        temporaryBlockedUntil: null,
        blockedAt: null,
        updatedAt: now,
      });

      const blockedUserLogin = allUserLogins.find((userLogin) => userLogin.userId == blockedUserId);
      expect(blockedUserLogin).to.deep.contain({
        failureCount: 0,
        temporaryBlockedUntil: null,
        blockedAt: null,
        updatedAt: now,
      });

      const aNotToTouchBlockedUserLogin = allUserLogins.find(
        (userLogin) => userLogin.userId == aNotToTouchBlockedUserId,
      );
      expect(aNotToTouchBlockedUserLogin).to.deep.contain({
        failureCount: 500,
        blockedAt: new Date('2020-01-01'),
        updatedAt: new Date('2020-01-01'),
      });
    });
  });
});

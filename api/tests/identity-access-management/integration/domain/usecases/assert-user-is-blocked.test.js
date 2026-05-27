import sinon from 'sinon';

import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { UserIsBlocked, UserIsTemporaryBlocked } from '../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Identity Access Management | Integration | Domain | UseCase | assert-user-is-blocked', function () {
  let clock;
  const now = new Date('2024-04-05T03:04:05Z');

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  context('when the user is not blocked', function () {
    it('resolves without throwing an error', async function () {
      // given
      const user = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildUserLogin({
        userId: user.id,
        failureCount: 0,
        blockedAt: null,
        temporaryBlockedUntil: null,
      });
      await databaseBuilder.commit();

      // when
      const result = await usecases.assertUserIsBlocked({ emailOrUsername: user.email });

      // then
      expect(result).to.be.undefined;
    });
  });

  context('when the user is blocked', function () {
    context('when user is logging in with email', function () {
      it('throws UserIsBlocked error', async function () {
        // given
        const user = databaseBuilder.factory.buildUser();
        databaseBuilder.factory.buildUserLogin({
          userId: user.id,
          failureCount: 30,
          blockedAt: new Date('2024-04-05T03:04:05Z'),
          temporaryBlockedUntil: null,
        });
        await databaseBuilder.commit();

        // when / then
        const error = await catchErr(usecases.assertUserIsBlocked)({ emailOrUsername: user.email });
        expect(error).to.be.instanceOf(UserIsBlocked);
        expect(error.meta.isLoginFailureWithUsername).to.be.false;
      });
    });

    context('when user is logging in with username', function () {
      it('throws UserIsBlocked error', async function () {
        // given
        const user = databaseBuilder.factory.buildUser({ username: 'testuser' });
        databaseBuilder.factory.buildUserLogin({
          userId: user.id,
          failureCount: 30,
          blockedAt: new Date('2024-04-05T03:04:05Z'),
          temporaryBlockedUntil: null,
        });
        await databaseBuilder.commit();

        // when / then
        const error = await catchErr(usecases.assertUserIsBlocked)({ emailOrUsername: user.username });
        expect(error).to.be.instanceOf(UserIsBlocked);
        expect(error.meta.isLoginFailureWithUsername).to.be.true;
      });
    });
  });

  context('when the user is temporary blocked', function () {
    context('when user is logging in with email', function () {
      it('throws UserIsTemporaryBlocked error', async function () {
        // given
        const user = databaseBuilder.factory.buildUser();
        databaseBuilder.factory.buildUserLogin({
          userId: user.id,
          failureCount: 10,
          blockedAt: null,
          temporaryBlockedUntil: new Date('2024-04-05T05:04:05Z'),
        });
        await databaseBuilder.commit();

        // when / then
        const error = await catchErr(usecases.assertUserIsBlocked)({ emailOrUsername: user.email });
        expect(error).to.be.instanceOf(UserIsTemporaryBlocked);
        expect(error.meta.isLoginFailureWithUsername).to.be.false;
        expect(error.meta.blockingDurationMs).to.be.equal(120000); // 2 minutes in milliseconds
      });
    });

    context('when user is logging in with username', function () {
      it('throws UserIsTemporaryBlocked error', async function () {
        // given
        const user = databaseBuilder.factory.buildUser({ username: 'testuser' });
        databaseBuilder.factory.buildUserLogin({
          userId: user.id,
          failureCount: 10,
          blockedAt: null,
          temporaryBlockedUntil: new Date('2024-04-05T05:04:05Z'),
        });
        await databaseBuilder.commit();

        // when / then
        const error = await catchErr(usecases.assertUserIsBlocked)({ emailOrUsername: user.username });
        expect(error).to.be.instanceOf(UserIsTemporaryBlocked);
        expect(error.meta.isLoginFailureWithUsername).to.be.true;
        expect(error.meta.blockingDurationMs).to.be.equal(120000); // 2 minutes in milliseconds
      });
    });
  });
});

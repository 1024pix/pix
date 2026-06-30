import sinon from 'sinon';

import { UserLogin } from '../../../../../src/identity-access-management/domain/models/UserLogin.js';
import { config } from '../../../../../src/shared/config.js';
import { expect } from '../../../../test-helper.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Domain | Models | UserLogin', function () {
  let clock;
  const now = new Date('2022-11-28T12:00:00Z');

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  describe('#remainingAttempts', function () {
    it('returns remaining attempts before blocking', function () {
      // given
      const { blockingLimitFailureCount } = config.login;
      const userLogin = new UserLogin({ userId: 666, failureCount: 0 });

      // when
      const remainingAttempts = userLogin.remainingAttempts;

      // then
      expect(remainingAttempts).to.equal(blockingLimitFailureCount);
    });

    it('returns 0 when failure count is greater than blocking limit', function () {
      // given
      const { blockingLimitFailureCount } = config.login;
      const userLogin = new UserLogin({ userId: 666, failureCount: blockingLimitFailureCount + 1 });

      // when
      const remainingAttempts = userLogin.remainingAttempts;

      // then
      expect(remainingAttempts).to.equal(0);
    });

    it('returns 0 when failure count is equal to blocking limit', function () {
      // given
      const { blockingLimitFailureCount } = config.login;
      const userLogin = new UserLogin({ userId: 666, failureCount: blockingLimitFailureCount });

      // when
      const remainingAttempts = userLogin.remainingAttempts;

      // then
      expect(remainingAttempts).to.equal(0);
    });
  });

  describe('#shouldWarnRemainingAttempts', function () {
    it('returns true to warn remaining attempts is reaching final block', function () {
      // given
      const userLogin = new UserLogin({ userId: 666, failureCount: 25 });

      // when
      const shouldWarnRemainingAttempts = userLogin.shouldWarnRemainingAttempts;

      // then
      expect(shouldWarnRemainingAttempts).to.equal(true);
    });

    it('returns false when remaining attempts is not reaching final block yet', function () {
      // given
      const userLogin = new UserLogin({ userId: 666, failureCount: 15 });

      // when
      const shouldWarnRemainingAttempts = userLogin.shouldWarnRemainingAttempts;

      // then
      expect(shouldWarnRemainingAttempts).to.equal(false);
    });
  });

  describe('#incrementFailureCount', function () {
    it('increments failure count', function () {
      // given
      const userLogin = new UserLogin({ userId: 666 });

      // when
      userLogin.incrementFailureCount();

      // then
      expect(userLogin.failureCount).to.equal(1);
    });
  });

  describe('#computeBlockingDurationMs', function () {
    it('returns the blocking duration in milliseconds based on 10 failures', function () {
      // given
      const userLogin = new UserLogin({ userId: 666, failureCount: 10 });

      // when
      const blockingDuration = userLogin.computeBlockingDurationMs();

      // then
      const expectedDurationMs = 120000; // 2 minutes in milliseconds
      expect(blockingDuration).to.equal(expectedDurationMs);
    });

    it('returns the blocking duration in milliseconds based on 20 failures', function () {
      // given
      const userLogin = new UserLogin({ userId: 666, failureCount: 20 });

      // when
      const blockingDuration = userLogin.computeBlockingDurationMs();

      // then
      const expectedDurationMs = 240000; // 4 minutes in milliseconds
      expect(blockingDuration).to.equal(expectedDurationMs);
    });
  });

  describe('#resetUserTemporaryBlocking', function () {
    it('resets failure count and reset temporary blocked until', function () {
      // given
      const userLogin = new UserLogin({
        userId: 666,
        failureCount: 45,
        temporaryBlockedUntil: new Date('2022-11-25'),
      });

      // when
      userLogin.resetUserTemporaryBlocking();

      // then
      expect(userLogin.failureCount).to.equal(0);
      expect(userLogin.temporaryBlockedUntil).to.be.null;
    });
  });

  describe('#isUserTemporaryBlocked', function () {
    describe('when temporaryBlockedUntil is in the past', function () {
      it('returns false', function () {
        // given
        const oneHourInThePast = new Date(Date.now() - 3600 * 1000);
        const userLogin = new UserLogin({
          userId: 666,
          temporaryBlockedUntil: oneHourInThePast,
        });

        // when
        const result = userLogin.isUserMarkedAsTemporaryBlocked();

        // then
        expect(result).to.be.false;
      });
    });

    describe('when temporaryBlockedUntil is in the future', function () {
      it('returns true', function () {
        // given
        const oneHourInTheFuture = new Date(Date.now() + 3600 * 1000);
        const userLogin = new UserLogin({
          userId: 666,
          temporaryBlockedUntil: oneHourInTheFuture,
        });

        // when
        const result = userLogin.isUserMarkedAsTemporaryBlocked();

        // then
        expect(result).to.be.true;
      });
    });

    describe('when temporaryBlockedUntil is not set', function () {
      it('returns false', function () {
        // given
        const userLogin = new UserLogin({
          userId: 666,
          temporaryBlockedUntil: null,
        });

        // when
        const result = userLogin.isUserMarkedAsTemporaryBlocked();

        // then
        expect(result).to.be.false;
      });
    });
  });

  describe('#markUserAsTemporarilyBlocked', function () {
    it('sets temporary block until date', function () {
      // given
      const multipleOfThresholdFailureCount = config.login.temporaryBlockingThresholdFailureCount * 2;
      const userLogin = new UserLogin({
        userId: 666,
        failureCount: multipleOfThresholdFailureCount,
      });

      // when
      userLogin.markUserAsTemporarilyBlocked();

      // then
      expect(userLogin.temporaryBlockedUntil).to.deepEqualInstance(new Date('2022-11-28T12:04:00Z'));
    });
  });

  describe('#hasBeenTemporaryBlocked', function () {
    context('when user has failure count greater than 0', function () {
      it('returns true', function () {
        // given
        const userLogin = new UserLogin({ failureCount: 1, temporaryBlockedUntil: null });

        // when
        const result = userLogin.hasFailedAtLeastOnce();

        // then
        expect(result).to.be.true;
      });
    });

    context('when user has a temporary blocked until date', function () {
      it('returns true', function () {
        // given
        const userLogin = new UserLogin({ temporaryBlockedUntil: new Date('2022-11-28T15:00:00Z') });

        // when
        const result = userLogin.hasFailedAtLeastOnce();

        // then
        expect(result).to.be.true;
      });
    });

    context('when user has no failure count nor temporary blocked until date', function () {
      it('returns false', function () {
        // given
        const userLogin = new UserLogin({ failureCount: 0, temporaryBlockedUntil: null });

        // when
        const result = userLogin.hasFailedAtLeastOnce();

        // then
        expect(result).to.be.false;
      });
    });
  });

  describe('#isUserBlocked', function () {
    context('when user reaches the limit failure count but is not yet blocked', function () {
      it('returns false', function () {
        // given
        const blockingLimitFailureCount = config.login.blockingLimitFailureCount;
        const userLogin = new UserLogin({ failureCount: blockingLimitFailureCount, blockedAt: null });

        // when
        const result = userLogin.isUserMarkedAsBlocked();

        // then
        expect(result).to.be.false;
      });
    });

    context('when user has blockedAt date', function () {
      it('returns true', function () {
        // given
        const blockingLimitFailureCount = config.login.blockingLimitFailureCount;
        const userLogin = new UserLogin({ failureCount: blockingLimitFailureCount, blockedAt: new Date('2022-11-29') });

        // when
        const result = userLogin.isUserMarkedAsBlocked();

        // then
        expect(result).to.be.true;
      });
    });

    context('when user has no failure count nor blockedAt date', function () {
      it('returns false', function () {
        // given
        const blockingLimitFailureCount = config.login.blockingLimitFailureCount;
        const userLogin = new UserLogin({ failureCount: blockingLimitFailureCount, blockedAt: null });

        // when
        const result = userLogin.isUserMarkedAsBlocked();

        // then
        expect(result).to.be.false;
      });
    });
  });

  describe('#markUserAsBlocked', function () {
    it('blocks user', function () {
      // given
      const userLogin = new UserLogin({});

      // when
      userLogin.markUserAsBlocked();

      // then
      expect(userLogin.blockedAt).to.deepEqualInstance(new Date('2022-11-28T12:00:00Z'));
      expect(userLogin.temporaryBlockedUntil).to.be.null;
    });

    context('when the user was temporarily blocked and must be blocked', function () {
      it('blocks user and removes temporaryBlockedUntil', function () {
        // given
        const userLogin = new UserLogin({ temporaryBlockedUntil: new Date('2022-11-25') });

        // when
        userLogin.markUserAsBlocked();

        // then
        expect(userLogin.blockedAt).to.deepEqualInstance(new Date('2022-11-28T12:00:00Z'));
        expect(userLogin.temporaryBlockedUntil).to.be.null;
      });
    });
  });

  describe('#shouldMarkUserAsTemporarilyBlocked', function () {
    context('when failure count is lower than temporary blocking threshold failure count', function () {
      it('returns false', function () {
        // given
        const lowerThanThresholdFailureCount = config.login.temporaryBlockingThresholdFailureCount - 1;
        const userLogin = new UserLogin({ failureCount: lowerThanThresholdFailureCount });

        // when
        const result = userLogin.shouldMarkUserAsTemporarilyBlocked();

        // then
        expect(result).to.be.false;
      });
    });

    context('when failure count is lower than a multiple of temporary blocking threshold failure count', function () {
      it('returns false', function () {
        // given
        const lowerThanThresholdFailureCount = config.login.temporaryBlockingThresholdFailureCount * 2 - 1;
        const userLogin = new UserLogin({ failureCount: lowerThanThresholdFailureCount });

        // when
        const result = userLogin.shouldMarkUserAsTemporarilyBlocked();

        // then
        expect(result).to.be.false;
      });
    });

    context('when failure count equals a multiple of temporary blocking threshold failure count', function () {
      it('returns true', function () {
        // given
        const multipleOfThresholdFailureCount = config.login.temporaryBlockingThresholdFailureCount * 2;
        const userLogin = new UserLogin({ failureCount: multipleOfThresholdFailureCount });

        // when
        const result = userLogin.shouldMarkUserAsTemporarilyBlocked();

        // then
        expect(result).to.be.true;
      });
    });
  });

  describe('#shouldMarkUserAsBlocked', function () {
    context('when failure count is lower than the limit failure count', function () {
      it('returns false', function () {
        // given
        const failureCount = config.login.blockingLimitFailureCount - 1;
        const userLogin = new UserLogin({ failureCount });

        // when
        const result = userLogin.shouldMarkUserAsBlocked();

        // then
        expect(result).to.be.false;
      });
    });

    context('when failure count equals the limit failure count', function () {
      it('returns true', function () {
        // given
        const blockingLimitFailureCount = config.login.blockingLimitFailureCount;
        const userLogin = new UserLogin({ failureCount: blockingLimitFailureCount });

        // when
        const result = userLogin.shouldMarkUserAsBlocked();

        // then
        expect(result).to.be.true;
      });
    });

    context('when failure count is upper than the limit failure count', function () {
      it('returns true', function () {
        // given
        const failureCount = config.login.blockingLimitFailureCount + 1;
        const userLogin = new UserLogin({ failureCount });

        // when
        const result = userLogin.shouldMarkUserAsBlocked();

        // then
        expect(result).to.be.true;
      });
    });
  });

  describe('#shouldSendConnectionWarning', function () {
    context('when user has connected after a long period since last connection date', function () {
      it('returns true', function () {
        // given
        const emailConnectionWarningPeriodMs = config.login.emailConnectionWarningPeriod;
        const lastConnectionDate = new Date(Date.now() - emailConnectionWarningPeriodMs);
        const userLogin = domainBuilder.identityAccessManagement.buildUserLogin({ lastLoggedAt: lastConnectionDate });

        // when
        const result = userLogin.shouldSendConnectionWarning();

        // then
        expect(result).to.be.true;
      });
    });

    context('when user has connected before the connection warning period', function () {
      it('returns false', function () {
        // given
        const lastConnectionDate = new Date(Date.now() - 1);
        const userLogin = domainBuilder.identityAccessManagement.buildUserLogin({ lastLoggedAt: lastConnectionDate });

        // when
        const result = userLogin.shouldSendConnectionWarning();

        // then
        expect(result).to.be.false;
      });
    });

    context("when user's last connection is not specified", function () {
      it('returns false', function () {
        // given
        const userLogin = domainBuilder.identityAccessManagement.buildUserLogin();

        // when
        const result = userLogin.shouldSendConnectionWarning();

        // then
        expect(result).to.be.false;
      });
    });
  });

  describe('#resetUserBlocking', function () {
    it('resets failure count and temporary blocked until', function () {
      // given
      const blockingLimitFailureCount = config.login.blockingLimitFailureCount;
      const userLogin = new UserLogin({
        userId: 666,
        failureCount: blockingLimitFailureCount,
        temporaryBlockedUntil: new Date('2022-11-25'),
        blockedAt: new Date('2022-12-01'),
      });

      // when
      userLogin.resetUserBlocking();

      // then
      expect(userLogin.failureCount).to.equal(0);
      expect(userLogin.temporaryBlockedUntil).to.be.null;
      expect(userLogin.blockedAt).to.be.null;
    });
  });

  describe('#anonymize', function () {
    it('anonymizes user login info', function () {
      // given
      const userLogin = new UserLogin({
        id: 1,
        createdAt: new Date('2012-12-12T12:25:34Z'),
        updatedAt: new Date('2023-03-23T09:44:30Z'),
        temporaryBlockedUntil: new Date('2023-03-23T08:16:16Z'),
        blockedAt: new Date('2023-03-23T09:44:30Z'),
      });

      // when
      const anonymizedUserLogin = userLogin.anonymize();

      // then
      expect(anonymizedUserLogin.id).to.be.equal(1);
      expect(anonymizedUserLogin.createdAt.toISOString()).to.equal('2012-12-01T00:00:00.000Z');
      expect(anonymizedUserLogin.updatedAt.toISOString()).to.equal('2023-03-01T00:00:00.000Z');
      expect(anonymizedUserLogin.temporaryBlockedUntil).to.be.null;
      expect(anonymizedUserLogin.blockedAt).to.be.null;
      expect(anonymizedUserLogin.lastLoggedAt).to.be.undefined;
    });

    context('when there is a lastLoggedAt', function () {
      it('keeps the lastLoggedAt date and generalizes it', function () {
        // given
        const userLogin = new UserLogin({
          id: 1,
          lastLoggedAt: new Date('2023-02-18T18:18:02Z'),
        });

        // when
        const anonymizedUserLogin = userLogin.anonymize();

        // then
        expect(anonymizedUserLogin.lastLoggedAt.toISOString()).to.equal('2023-02-01T00:00:00.000Z');
      });
    });
  });
});

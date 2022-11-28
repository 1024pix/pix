const { expect } = require('../../../test-helper');
const UserLogin = require('../../../../lib/domain/models/UserLogin');
const settings = require('../../../../lib/config');

describe('Unit | Domain | Models | UserLogin', function () {
  describe('#incrementFailureCount', function () {
    it('should increment failure count', function () {
      // given
      const userLogin = new UserLogin({ userId: 666 });

      // when
      userLogin.incrementFailureCount();

      // then
      expect(userLogin.failureCount).to.equal(1);
    });
  });

  describe('#resetUserTemporaryBlocking', function () {
    it('should reset failure count and reset temporary blocked until', function () {
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
      it('should return false', function () {
        // given
        const oneHourInThePast = new Date(Date.now() - 3600 * 1000);
        const userLogin = new UserLogin({
          userId: 666,
          temporaryBlockedUntil: oneHourInThePast,
        });

        // when
        const result = userLogin.isUserTemporaryBlocked();

        // then
        expect(result).to.be.false;
      });
    });

    describe('when temporaryBlockedUntil is in the future', function () {
      it('should return true', function () {
        // given
        const oneHourInTheFuture = new Date(Date.now() + 3600 * 1000);
        const userLogin = new UserLogin({
          userId: 666,
          temporaryBlockedUntil: oneHourInTheFuture,
        });

        // when
        const result = userLogin.isUserTemporaryBlocked();

        // then
        expect(result).to.be.true;
      });
    });

    describe('when temporaryBlockedUntil is not set', function () {
      it('should return false', function () {
        // given
        const userLogin = new UserLogin({
          userId: 666,
          temporaryBlockedUntil: null,
        });

        // when
        const result = userLogin.isUserTemporaryBlocked();

        // then
        expect(result).to.be.false;
      });
    });
  });
});

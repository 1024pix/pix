const { expect, sinon } = require('../../../test-helper');
const UserLogin = require('../../../../lib/domain/models/UserLogin');
describe('Unit | Domain | Models | UserLogin', function () {
  let clock;
  const now = new Date('2022-11-28T12:00:00Z');

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now });
  });

  afterEach(function () {
    clock.restore();
  });

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

  describe('#blockUserTemporarily', function () {
    it('should set temporary block until date', function () {
      // given
      const multipleOfThreshold = 10 * 2;
      const userLogin = new UserLogin({
        userId: 666,
        failureCount: multipleOfThreshold,
      });

      // when
      userLogin.blockUserTemporarily();

      // then
      expect(userLogin.temporaryBlockedUntil).to.deepEqualInstance(new Date('2022-11-28T12:04:00Z'));
    });
  });

  describe('#hasBeenTemporaryBlocked', function () {
    context('when user has failure count greater than 0', function () {
      it('should return true', function () {
        // given
        const userLogin = new UserLogin({ failureCount: 1, temporaryBlockedUntil: null });

        // when
        const result = userLogin.hasBeenTemporaryBlocked();

        // then
        expect(result).to.be.true;
      });
    });

    context('when user has a temporary blocked until date', function () {
      it('should return true', function () {
        // given
        const userLogin = new UserLogin({ temporaryBlockedUntil: new Date('2022-11-28T15:00:00Z') });

        // when
        const result = userLogin.hasBeenTemporaryBlocked();

        // then
        expect(result).to.be.true;
      });
    });

    context('when user has no failure count nor temporary blocked until date', function () {
      it('should return false', function () {
        // given
        const userLogin = new UserLogin({ failureCount: 0, temporaryBlockedUntil: null });

        // when
        const result = userLogin.hasBeenTemporaryBlocked();

        // then
        expect(result).to.be.false;
      });
    });
  });

  describe('#isUserBlocked', function () {
    context('when user reaches the limit failure count but is not yet blocked', function () {
      it('returns false', function () {
        // given
        const userLogin = new UserLogin({ failureCount: 50, blockedAt: null });

        // when
        const result = userLogin.isUserBlocked();

        // then
        expect(result).to.be.false;
      });
    });

    context('when user has blockedAt date', function () {
      it('returns true', function () {
        // given
        const userLogin = new UserLogin({ failureCount: 50, blockedAt: new Date('2022-11-29') });

        // when
        const result = userLogin.isUserBlocked();

        // then
        expect(result).to.be.true;
      });
    });

    context('when user has no failure count nor blockedAt date', function () {
      it('returns false', function () {
        // given
        const userLogin = new UserLogin({ failureCount: 50, blockedAt: null });

        // when
        const result = userLogin.isUserBlocked();

        // then
        expect(result).to.be.false;
      });
    });
  });

  describe('#blockUser', function () {
    it('blocks user', function () {
      // given
      const userLogin = new UserLogin({});

      // when
      userLogin.blockUser();

      // then
      expect(userLogin.blockedAt).to.deepEqualInstance(new Date('2022-11-28T12:00:00Z'));
    });
  });

  describe('#shouldBlockUserTemporarily', function () {
    context('when failure count is lower than failure count threshold', function () {
      it('returns false', function () {
        // given
        const userLogin = new UserLogin({ failureCount: 5 });

        // when
        const result = userLogin.shouldBlockUserTemporarily();

        // then
        expect(result).to.be.false;
      });
    });

    context('when failure count equals failure count threshold', function () {
      it('returns true', function () {
        // given
        const userLogin = new UserLogin({ failureCount: 20 });

        // when
        const result = userLogin.shouldBlockUserTemporarily();

        // then
        expect(result).to.be.true;
      });
    });
  });

  describe('#shouldBlockUser', function () {
    context('when failure count is lower than the limit failure count', function () {
      it('returns false', function () {
        // given
        const userLogin = new UserLogin({ failureCount: 49 });

        // when
        const result = userLogin.shouldBlockUser();

        // then
        expect(result).to.be.false;
      });
    });

    context('when failure count equals the limit failure count', function () {
      it('returns true', function () {
        // given
        const userLogin = new UserLogin({ failureCount: 50 });

        // when
        const result = userLogin.shouldBlockUser();

        // then
        expect(result).to.be.true;
      });
    });
  });

  describe('#unblockUser', function () {
    it('should reset failure count and reset temporary blocked until', function () {
      // given
      const userLogin = new UserLogin({
        userId: 666,
        failureCount: 50,
        temporaryBlockedUntil: new Date('2022-11-25'),
        blockedAt: new Date('2022-12-01'),
      });

      // when
      userLogin.unblockUser();

      // then
      expect(userLogin.failureCount).to.equal(0);
      expect(userLogin.temporaryBlockedUntil).to.be.null;
      expect(userLogin.blockedAt).to.be.null;
    });
  });
});

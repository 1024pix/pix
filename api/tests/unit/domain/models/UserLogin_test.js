const UserLogin = require('../../../../lib/domain/models/UserLogin');
const { expect } = require('../../../test-helper');

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
});

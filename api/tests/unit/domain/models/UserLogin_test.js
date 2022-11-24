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
});

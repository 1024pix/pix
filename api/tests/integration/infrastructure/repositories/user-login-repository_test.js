const { databaseBuilder, expect } = require('../../../test-helper');
const userLoginRepository = require('../../../../lib/infrastructure/repositories/user-login-repository');
const UserLogin = require('../../../../lib/domain/models/UserLogin');

describe('Integration | Repository | UserLoginRepository', function () {
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
});

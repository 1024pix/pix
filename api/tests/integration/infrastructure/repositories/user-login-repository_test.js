const { databaseBuilder, expect, knex } = require('../../../test-helper');
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

  describe('#create', function () {
    afterEach(async function () {
      await knex('user-logins').delete();
    });

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
});

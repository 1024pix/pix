const { expect, databaseBuilder, knex } = require('../../test-helper');
const { cleanAnonymizedUsersPasswords } = require('../../../scripts/clean-anonymized-users-passwords');

describe('Integration | Scripts | clean-anonymized-users-passwords', function () {
  describe('#cleanAnonymizedUsersPasswords', function () {
    it("should delete given user's passwords", async function () {
      // given
      databaseBuilder.factory.buildUser({ id: 1 });
      databaseBuilder.factory.buildUser({ id: 3 });
      databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndPassword({ userId: 1 });
      databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({ userId: 3 });
      await databaseBuilder.commit();

      // when
      const arrayOfAnonymizedUsersIds = [1, 3];
      const anonymizedUserIdsWithPasswordDeleted = await cleanAnonymizedUsersPasswords({ arrayOfAnonymizedUsersIds });

      // then
      const authenticationMethodsForUsers1 = await knex('authentication-methods').where({ userId: 1 });
      expect(authenticationMethodsForUsers1.length).to.equal(0);

      const authenticationMethodsForUsers3 = await knex('authentication-methods').where({ userId: 3 });
      expect(authenticationMethodsForUsers3.length).to.equal(0);

      expect(anonymizedUserIdsWithPasswordDeleted).to.deep.equal(arrayOfAnonymizedUsersIds);
    });
  });
});

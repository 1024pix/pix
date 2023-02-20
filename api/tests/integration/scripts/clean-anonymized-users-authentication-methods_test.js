import { expect, databaseBuilder, knex } from '../../test-helper';
import { cleanAnonymizedAuthenticationMethods } from '../../../scripts/clean-anonymized-users-authentication-methods';

describe('Integration | Scripts | clean-anonymized-users-authentication-methods', function () {
  describe('#cleanAnonymizedAuthenticationMethods', function () {
    it("should delete given user's authentication methods", async function () {
      // given
      databaseBuilder.factory.buildUser({ id: 1 });
      databaseBuilder.factory.buildUser({ id: 3 });
      databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndPassword({ userId: 1 });
      databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({ userId: 1 });
      databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({ userId: 3 });
      await databaseBuilder.commit();

      // when
      const arrayOfAnonymizedUsersIds = [1, 3];
      const anonymizedUserIdsWithAuthenticationMethodsDeleted = await cleanAnonymizedAuthenticationMethods({
        arrayOfAnonymizedUsersIds,
      });

      // then
      const authenticationMethodsForUsers1 = await knex('authentication-methods').where({ userId: 1 });
      expect(authenticationMethodsForUsers1.length).to.equal(0);

      const authenticationMethodsForUsers3 = await knex('authentication-methods').where({ userId: 3 });
      expect(authenticationMethodsForUsers3.length).to.equal(0);

      expect(anonymizedUserIdsWithAuthenticationMethodsDeleted).to.deep.equal(arrayOfAnonymizedUsersIds);
    });
  });
});

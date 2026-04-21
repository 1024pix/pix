import * as userApi from '../../../../../src/privacy/application/api/users-api.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | Privacy | Application | Api | users', function () {
  describe('#anonymizeUser', function () {
    it('anonymizes everything related to the user', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      const anonymizedByUserId = userId;
      const anonymizedByUserRole = 'USER';
      const client = 'PIX_APP';

      // when & then
      await expect(userApi.anonymizeUser({ userId, anonymizedByUserId, anonymizedByUserRole, client })).to.not.be
        .rejected;
    });
  });

  describe('#canSelfDeleteAccount', function () {
    it('indicates if a user can self delete their account', async function () {
      // given

      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      // when
      const result = await userApi.canSelfDeleteAccount({ userId });

      // then
      expect(result).to.equal(true);
    });
  });
});

import * as userApi from '../../../../../src/privacy/application/api/users-api.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | Privacy | Application | Api | users', function () {
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

import * as userApi from '../../../../../src/identity-access-management/application/api/users-api.js';
import { databaseBuilder, expect } from '../../../../test-helper.js';

describe('Integration | Application | users-api', function () {
  describe('#markLevelSevenInfoAsSeen', function () {
    it('should return user information', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser({ hasSeenLevelSevenInfo: false }).id;
      await databaseBuilder.commit();

      // when
      const actualUser = await userApi.markLevelSevenInfoAsSeen({ userId });

      // then
      expect(actualUser.hasSeenLevelSevenInfo).to.be.true;
    });
  });
});

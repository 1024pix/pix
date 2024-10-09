import * as userApi from '../../../../../src/identity-access-management/application/api/users-api.js';
import { databaseBuilder, expect } from '../../../../test-helper.js';

describe('Integration | Application | users-api', function () {
  describe('#markNewDashboardInfoAsSeen', function () {
    it('should return user information', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser({ hasSeenNewDashboardInfo: false }).id;
      await databaseBuilder.commit();

      // when
      const actualUser = await userApi.markNewDashboardInfoAsSeen({ userId });

      // then
      expect(actualUser.hasSeenNewDashboardInfo).to.be.true;
    });
  });
});

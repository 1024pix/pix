import { expect, databaseBuilder } from '../../test-helper';
import { markUsersRequiringTermsOfServiceValidationForRevalidation } from '../../../scripts/mark-users-for-TermsOfService-revalidation';

describe('Integration | Scripts | mark-users-for-TermsOfService-revalidation_test', function () {
  describe('#markUsersRequiringTermsOfServiceValidationForRevalidation', function () {
    it('should not revalidate terms of service if he did not validate them before', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser({ cgu: false }).id;
      await databaseBuilder.commit();

      // when
      const updatedUserIds = await markUsersRequiringTermsOfServiceValidationForRevalidation();

      // then
      expect(updatedUserIds).to.not.include(userId);
    });

    it('should revalidate terms of service if he validated them before', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser({ cgu: true }).id;
      await databaseBuilder.commit();

      // when
      const updatedUserIds = await markUsersRequiringTermsOfServiceValidationForRevalidation();

      // then
      expect(updatedUserIds).to.include(userId);
    });
  });
});

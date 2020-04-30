const { expect, databaseBuilder } = require('../../test-helper');

const {
  markUsersRequiringTermsOfServiceValidationForRevalidation
} = require('../../../scripts/mark-users-for-TermsOfService-revalidation');

describe('Integration | Scripts | mark-users-for-TermsOfService-revalidation_test', () => {

  describe('#markUsersRequiringTermsOfServiceValidationForRevalidation', () => {

    it('should not revalidate terms of service if he did not validate them before', async () => {
      // given
      const userId = databaseBuilder.factory.buildUser({ cgu: false  }).id;
      await databaseBuilder.commit();

      // when
      const updatedUserIds = await markUsersRequiringTermsOfServiceValidationForRevalidation();

      // then
      expect(updatedUserIds).to.not.include(userId);
    });

    it('should revalidate terms of service if he validated them before', async () => {
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

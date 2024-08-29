import { anonymizedUserRepository } from '../../../../../src/identity-access-management/infrastructure/repositories/anonymized-user.repository.js';
import { databaseBuilder, expect } from '../../../../test-helper.js';

describe('Integration | Identity Access Management | Infrastructure | Repository | Anonymized User', function () {
  describe('#findLegacyAnonymizedIds', function () {
    it('returns legacy anonymized user ids', async function () {
      // given
      databaseBuilder.factory.buildUser();
      const anonymizedUser = databaseBuilder.factory.buildUser({ hasBeenAnonymised: true });
      databaseBuilder.factory.buildUser({ hasBeenAnonymised: true, lastName: '(anonymised)' });
      await databaseBuilder.commit();

      // when
      const anonymizedUserIds = await anonymizedUserRepository.findLegacyAnonymizedIds();

      // then
      expect(anonymizedUserIds).to.be.deep.equal([anonymizedUser.id]);
    });
  });
});

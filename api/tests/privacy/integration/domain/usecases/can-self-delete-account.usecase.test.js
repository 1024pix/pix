import { usecases } from '../../../../../src/privacy/domain/usecases/index.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | Privacy | Domain | UseCase | can-self-delete-account', function () {
  context('When user is eligible', function () {
    it('returns true', async function () {
      // given
      const user = databaseBuilder.factory.buildUser();
      await databaseBuilder.commit();

      // when
      const result = await usecases.canSelfDeleteAccount({ userId: user.id });

      // then
      expect(result).to.be.true;
    });
  });
});

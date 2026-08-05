import { anonymizeServices } from '../../../../../../src/privacy/domain/services/anonymize-services/index.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Integration | Privacy | Domain | Services | AnonymizeServices | can-anonymize-itself', function () {
  context('When user is eligible', function () {
    it('returns true', async function () {
      // given
      const user = databaseBuilder.factory.buildUser();
      await databaseBuilder.commit();

      // when
      const result = await anonymizeServices.canAnonymizeItself({ userId: user.id });

      // then
      expect(result).to.be.true;
    });
  });
});

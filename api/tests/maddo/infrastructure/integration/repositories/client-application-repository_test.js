import { getJurisdiction } from '../../../../../src/maddo/infrastructure/repositories/client-application-repository.js';

import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Maddo | Infrastructure | Repositories | Integration | client application', function () {
  describe('#getJurisdiction', function () {
    it('returns jurisdiction of given clientId', async function () {
      // given
      const expectedJurisdiction = { rules: [{ name: 'tags', value: ['MEDNUM'] }] };
      const { clientId } = databaseBuilder.factory.buildClientApplication({ jurisdiction: expectedJurisdiction });
      await databaseBuilder.commit();

      // when
      const jurisdiction = await getJurisdiction(clientId);

      // then
      expect(jurisdiction).to.deep.equal(expectedJurisdiction);
    });
  });
});

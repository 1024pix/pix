import { expect } from '../../../test-helper.js';
import { databaseBuilder, knex } from '../../../tooling/databases.js';

describe('Integration | Infrastructure | knex-extensions', function () {
  context('QueryBuilder extension - whereInArray', function () {
    it('should return records that satisfy the where any clause', async function () {
      // given
      databaseBuilder.factory.buildCampaign({ id: 1 });
      databaseBuilder.factory.buildCampaign({ id: 2 });
      databaseBuilder.factory.buildCampaign({ id: 3 });
      await databaseBuilder.commit();

      // when
      const results = await knex.select('id').from('campaigns').whereInArray('id', [3, 2, 5]).orderBy('id');

      // then
      expect(results).to.deep.equal([{ id: 2 }, { id: 3 }]);
    });

    it('should return an empty array when no records satisfy the where any clause', async function () {
      // given
      databaseBuilder.factory.buildCampaign({ id: 1 });
      databaseBuilder.factory.buildCampaign({ id: 2 });
      databaseBuilder.factory.buildCampaign({ id: 3 });
      await databaseBuilder.commit();

      // when
      const results = await knex.select('id').from('campaigns').whereInArray('id', [4, 5]).orderBy('id');

      // then
      expect(results).to.be.empty;
    });
  });
});

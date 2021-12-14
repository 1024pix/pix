const { expect } = require('../../../../../test-helper');
const {
  main,
  databaseBuilder,
} = require('../../../../../../scripts/bigint/answers-pk/helpers/create-knowledge-elements');
const { knex } = require('../../../../../../db/knex-database-connection');

describe('Acceptance | Helpers | create-knowledge-elements.js', function () {
  describe('#main', function () {
    afterEach(async function () {
      await databaseBuilder.clean();
    });

    it('should create non migrated and migrated rows, with matching settings', async function () {
      // when
      await main();

      // then
      const { count: nonMigratedRowsCount } = await knex
        .from('knowledge-elements')
        .count('id')
        .whereBetween('id', [1, 50])
        .where({ answer_bigintId: -1 })
        .first();
      expect(nonMigratedRowsCount).to.equal(50);

      const { count: migratedRowsCount } = await knex
        .from('knowledge-elements')
        .count('id')
        .whereBetween('id', [51, 61])
        .whereNot({ answer_bigintId: -1 })
        .first();
      expect(migratedRowsCount).to.equal(10);

      const { startAt, endAt } = await knex
        .from('bigint-migration-settings')
        .select('startAt', 'endAt')
        .where({ table: 'knowledge-elements' })
        .first();

      expect(startAt).to.equal(1);
      expect(endAt).to.equal(50);
    });
  });
});

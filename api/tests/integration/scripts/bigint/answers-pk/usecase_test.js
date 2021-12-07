const { expect, databaseBuilder } = require('../../../../test-helper');
const { migrate } = require('../../../../../scripts/bigint/answers-pk/usecase');
const { knex } = require('../../../../../db/knex-database-connection');

describe('Integration | Use-case | usecase.js', function () {
  describe('#migrate', function () {
    afterEach(async function () {
      await knex.raw('DELETE FROM "bigint-migration-settings"');
    });

    it('should not update rows if not scheduled', async function () {
      // given
      databaseBuilder.factory.buildAnswer({ id: 1 });
      await databaseBuilder.commit();

      await knex('bigint-migration-settings').insert({
        isScheduled: false,
        chunkSize: 2,
      });

      // when
      await migrate();

      // then
      const result = await knex('answers').count('id').whereNull('intId');

      expect(result[0].count).to.equal(1);
    });

    it('should update rows if scheduled', async function () {
      // given
      databaseBuilder.factory.buildAnswer({ id: 1 });
      databaseBuilder.factory.buildAnswer({ id: 2 });
      await databaseBuilder.commit();

      await knex('bigint-migration-settings').insert({
        isScheduled: true,
        chunkSize: 2,
      });

      // when
      await migrate();

      // then
      const result = await knex('answers').count('id').whereNotNull('intId');

      expect(result[0].count).to.equal(2);
    });
  });
});

const { expect, databaseBuilder } = require('../../../../test-helper');
const { run } = require('../../../../../scripts/bigint/answers-pk/runner');
const { knex } = require('../../../../../db/knex-database-connection');

describe('Acceptance | Runner | runner.js', function () {
  describe('#run', function () {
    beforeEach(async function () {
      await knex.from('bigint-migration-settings').delete();
    });
    afterEach(async function () {
      await knex.from('bigint-migration-settings').delete();
    });
    it('should end with all rows migrated', async function () {
      // given
      for (let i = 1; i <= 7; i++) {
        databaseBuilder.factory.buildAnswer({ id: i });
      }
      await databaseBuilder.commit();
      await knex('answers').whereBetween('bigintId', [1, 5]).update({
        bigintId: -1,
      });

      await knex.from('bigint-migration-settings').insert({
        table: 'answers',
        isScheduled: true,
        pauseMilliseconds: 1,
        chunkSize: 2,
        startAt: 1,
        endAt: 5,
      });

      // when
      await run();

      // then
      const { count: nonMigratedRowsCount } = await knex('answers').count('id').where('bigintId', -1).first();
      expect(nonMigratedRowsCount).to.equal(0);
    });
  });
});

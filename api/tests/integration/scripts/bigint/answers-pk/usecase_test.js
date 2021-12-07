const { expect, databaseBuilder } = require('../../../../test-helper');
const settingsRepository = require('../../../../../scripts/bigint/answers-pk/settings-repository');
const answersRepository = require('../../../../../scripts/bigint/answers-pk/answers-repository');
const { migrate, externalSettings } = require('../../../../../scripts/bigint/answers-pk/usecase');
const { knex } = require('../../../../../db/knex-database-connection');

externalSettings.POLLING_INTERVAL_SECONDS = 1;

describe('Integration | Use-case | usecase.js', function () {
  describe('#migrate', function () {
    afterEach(async function () {
      await knex.raw('DELETE FROM "bigint-migration-settings"');
    });

    it('should end with all rows migrated', async function () {
      // given
      databaseBuilder.factory.buildAnswer({ id: 1 });
      databaseBuilder.factory.buildAnswer({ id: 2 });
      databaseBuilder.factory.buildAnswer({ id: 3 });
      databaseBuilder.factory.buildAnswer({ id: 4 });
      databaseBuilder.factory.buildAnswer({ id: 5 });
      databaseBuilder.factory.buildAnswer({ id: 6 });
      databaseBuilder.factory.buildAnswer({ id: 7 });
      await databaseBuilder.commit();
      await knex.from('answers').where('bigintId', '<=', 5).update({
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
      await migrate(settingsRepository, answersRepository);

      // then
      const { count: nonMigratedRowsCount } = await knex.from('answers').count('id').where('bigintId', -1).first();
      expect(nonMigratedRowsCount).to.equal(0);
    });
  });
});

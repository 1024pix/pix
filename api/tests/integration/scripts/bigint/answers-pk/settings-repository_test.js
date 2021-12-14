const { expect } = require('../../../../test-helper');
const SettingsRepository = require('../../../../../scripts/bigint/answers-pk/settings-repository');

const { knex } = require('../../../../../db/knex-database-connection');

describe('Integration | Repository | settings-repository.js', function () {
  describe('when instantiated with answers table', function () {
    const answerSettings = new SettingsRepository('answers');

    describe('#isScheduled', function () {
      afterEach(async function () {
        await knex.from('bigint-migration-settings').delete();
      });

      it('should return true if it can be run', async function () {
        // given
        await knex.from('bigint-migration-settings').insert({
          table: 'answers',
          isScheduled: true,
          pauseMilliseconds: 0,
          chunkSize: 2,
          startAt: 1,
          endAt: 2,
        });

        await knex.from('bigint-migration-settings').insert({
          table: 'knowledge-elements',
          isScheduled: false,
          pauseMilliseconds: 0,
          chunkSize: 2,
          startAt: 1,
          endAt: 2,
        });

        // when
        const result = await answerSettings.isScheduled();

        // then
        expect(result).to.be.true;
      });

      it('should return false if paused', async function () {
        // given
        await knex.from('bigint-migration-settings').insert({
          table: 'answers',
          isScheduled: false,
          pauseMilliseconds: 0,
          chunkSize: 2,
          startAt: 1,
          endAt: 2,
        });

        // when
        const result = await answerSettings.isScheduled();

        // then
        expect(result).to.be.false;
      });

      it('should throw an error if no settings', async function () {
        // when
        let message;
        try {
          await answerSettings.isScheduled();
        } catch (error) {
          message = error.message;
        }

        // then
        expect(message).to.equal('No settings found in bigint-migration-settings for table answers');
      });
    });
    describe('#pauseInterval', function () {
      afterEach(async function () {
        await knex.from('bigint-migration-settings').delete();
      });

      it('should return pauseMilliseconds', async function () {
        // given
        await knex.from('bigint-migration-settings').insert({
          table: 'answers',
          isScheduled: true,
          pauseMilliseconds: 3,
          chunkSize: 2,
          startAt: 1,
          endAt: 2,
        });

        // when
        const result = await answerSettings.pauseInterval();

        // then
        expect(result).to.equal(3);
      });
    });
    describe('#chunkSize', function () {
      afterEach(async function () {
        await knex.from('bigint-migration-settings').delete();
      });

      it('should return chunkSize', async function () {
        // given
        await knex.from('bigint-migration-settings').insert({
          table: 'answers',
          isScheduled: true,
          pauseMilliseconds: 3,
          chunkSize: 2,
          startAt: 1,
          endAt: 2,
        });

        // when
        const result = await answerSettings.chunkSize();

        // then
        expect(result).to.equal(2);
      });
    });
    describe('#migrationInterval', function () {
      afterEach(async function () {
        await knex.from('bigint-migration-settings').delete();
      });
      it('should return the migration interval', async function () {
        // given
        await knex.from('bigint-migration-settings').insert({
          table: 'answers',
          isScheduled: true,
          chunkSize: 2,
          startAt: 1,
          endAt: 2,
          pauseMilliseconds: 3,
        });

        // when
        const result = await answerSettings.migrationInterval();

        // then
        expect(result).to.deep.equal({ startAt: 1, endAt: 2 });
      });
    });
    describe('#markRowsAsMigrated', function () {
      afterEach(async function () {
        await knex.from('bigint-migration-settings').delete();
      });

      it('should persist last migrated row', async function () {
        // given
        await knex.from('bigint-migration-settings').insert({
          table: 'answers',
          isScheduled: true,
          pauseMilliseconds: 0,
          chunkSize: 2,
          startAt: 1,
          endAt: 5,
        });

        // when
        await answerSettings.markRowsAsMigrated(4);

        // then
        const { startAt } = await knex.from('bigint-migration-settings').select('startAt').first();
        expect(startAt).to.equal(4);
      });
    });
  });
});

const { expect } = require('../../../../test-helper');
const { isScheduled, settings } = require('../../../../../scripts/bigint/answers-pk/settings-repository');
const { knex } = require('../../../../../db/knex-database-connection');

describe('Integration | Repository | settings-repository.js', function () {
  describe('#isScheduled', function () {
    afterEach(async function () {
      await knex('bigint-migration-settings').delete();
    });

    it('should return true if it can be run', async function () {
      // given
      await knex('bigint-migration-settings').insert({
        isScheduled: true,
        chunkSize: 2,
      });

      // when
      const result = await isScheduled();

      // then
      expect(result).to.be.true;
    });

    it('should do false if should be paused', async function () {
      // given
      await knex('bigint-migration-settings').insert({
        isScheduled: false,
        chunkSize: 2,
      });

      // when
      const result = await isScheduled();

      // then
      expect(result).to.be.false;
    });
  });

  describe('#settings', function () {
    afterEach(async function () {
      await knex('bigint-migration-settings').delete();
    });

    it('should return chunkSize', async function () {
      // given
      await knex('bigint-migration-settings').insert({
        isScheduled: true,
        chunkSize: 2,
      });

      // when
      const result = await settings();

      // then
      expect(result).to.be.deep.equal({ chunkSize: 2 });
    });
  });
});

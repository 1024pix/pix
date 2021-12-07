const { expect } = require('../../test-helper');
const { knex } = require('../../../db/knex-database-connection');

describe('Integration | Database | constraints', function () {
  afterEach(async function () {
    await knex.from('bigint-migration-settings').delete();
  });
  it('should reject duplicate setting in bigint-migration-settings', async function () {
    // when
    const answerSettings = {
      table: 'answers',
      isScheduled: true,
      pauseMilliseconds: 0,
      chunkSize: 2,
      startAt: 1,
      endAt: 4,
    };

    await knex.from('bigint-migration-settings').insert(answerSettings);

    // when
    let throwError;
    try {
      await knex.from('bigint-migration-settings').insert(answerSettings);
    } catch (error) {
      throwError = error;
    }

    expect(throwError.message).to.equal(
      'insert into "bigint-migration-settings" ("chunkSize", "endAt", "isScheduled", "pauseMilliseconds", "startAt", "table") values ($1, $2, $3, $4, $5, $6) - duplicate key value violates unique constraint "bigint-migration-settings_table_key"'
    );
  });
});

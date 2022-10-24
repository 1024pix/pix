const { expect, sinon } = require('../../test-helper');
const knexDatabaseConnection = require('../../../db/knex-database-connection');
const knex = knexDatabaseConnection.knex;
const { asyncLocalStorageForTests: asyncLocalStorage } = require('../../../lib/infrastructure/monitoring-tools.js');
const config = require('../../../lib/config');

describe('Integration | Infrastructure | knex-database-performance-monitoring', function () {
  it('with knex monitoring disabled it should insert knex metrics in context', async function () {
    // given
    sinon.stub(config.logging, 'enableKnexPerformanceMonitoring').value(false);

    // when
    const store = await asyncLocalStorage.run({}, async () => {
      await knex.raw('SELECT 1 as value');
      return asyncLocalStorage.getStore();
    });

    // then
    expect(store.metrics.knexQueryCount).to.equal(1);
    expect(store.metrics.knexTotalTimeSpent).to.not.exist;
  });

  it('with knex monitoring enabled it should insert knex metrics in context', async function () {
    // given
    sinon.stub(config.logging, 'enableKnexPerformanceMonitoring').value(true);

    // when
    const store = await asyncLocalStorage.run({}, async () => {
      await knex.raw('SELECT 1 as value');
      return asyncLocalStorage.getStore();
    });

    // then
    expect(store.metrics.knexQueryCount).to.equal(1);
    expect(store.metrics.knexTotalTimeSpent).to.be.above(0);
  });
});

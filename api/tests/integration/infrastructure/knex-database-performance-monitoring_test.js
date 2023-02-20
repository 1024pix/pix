import { expect, sinon } from '../../test-helper';
import knexDatabaseConnection from '../../../db/knex-database-connection';
const knex = knexDatabaseConnection.knex;
import { asyncLocalStorageForTests as asyncLocalStorage } from '../../../lib/infrastructure/monitoring-tools.js';
import config from '../../../lib/config';
const selectQuery = knex.raw('SELECT 1 as value');

describe('Integration | Infrastructure | knex-database-performance-monitoring', function () {
  context('when knex monitoring is disabled', function () {
    beforeEach(async function () {
      sinon.stub(config.logging, 'enableKnexPerformanceMonitoring').value(false);
    });

    it('should store query count in context, but not the total time spent', async function () {
      // when
      const store = await asyncLocalStorage.run({}, async () => {
        await selectQuery;
        return asyncLocalStorage.getStore();
      });

      // then
      expect(store.metrics.knexQueryCount).to.equal(1);
      expect(store.metrics.knexTotalTimeSpent).to.not.exist;
    });
  });

  context('when knex monitoring is enabled', function () {
    beforeEach(async function () {
      sinon.stub(config.logging, 'enableKnexPerformanceMonitoring').value(true);
    });

    it('should store query count and total time spent in context', async function () {
      // when
      const store = await asyncLocalStorage.run({}, async () => {
        await selectQuery;
        return asyncLocalStorage.getStore();
      });

      // then
      expect(store.metrics.knexQueryCount).to.equal(1);
      expect(store.metrics.knexTotalTimeSpent).to.be.above(0);
    });
  });
});

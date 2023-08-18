import { expect, knex, sinon } from '../../../test-helper.js';
import * as pgBossRepository from '../../../../lib/infrastructure/repositories/pgboss-repository.js';
import { DomainTransaction } from '../../../../lib/infrastructure/DomainTransaction.js';

describe('Integration | Repository | PgBoss', function () {
  afterEach(function () {
    return knex('pgboss.job').truncate();
  });

  describe('#insert', function () {
    it('should insert two jobs', async function () {
      await pgBossRepository.insert([
        {
          name: 'Something',
          data: { prop: 1 },
          on_complete: true,
        },
        {
          name: 'Else',
          data: { prop: 2 },
          on_complete: true,
        },
      ]);

      const jobs = await knex('pgboss.job').whereIn('name', ['Something', 'Else']);
      expect(jobs.length).to.equal(2);
    });

    it('should use transaction', async function () {
      let transaction;
      await DomainTransaction.execute(function (domainTransaction) {
        sinon.stub(domainTransaction, 'knexTransaction').callsFake(knex);
        transaction = domainTransaction.knexTransaction;
        return pgBossRepository.insert(
          [
            {
              name: 'Something',
              data: { prop: 1 },
              on_complete: true,
            },
          ],
          domainTransaction,
        );
      });

      sinon.assert.called(transaction);
    });
  });
});

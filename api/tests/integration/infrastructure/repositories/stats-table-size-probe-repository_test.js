const { expect, knex } = require('../../../test-helper');
const { listAllPixTableNames } = require('../../../../db/knex-database-connection');
const statsTableSizeProbeRepository = require('../../../../lib/infrastructure/repositories/stats-table-size-probe-repository');

describe('Integration | Infrastructure | Repository | stats-table-size-probe-repository', () => {

  describe('#collect', () => {

    afterEach(() => {
      return knex('stats_table_size_probes').delete();
    });

    it('should save as many probes as pix tables', async () => {
      // when
      await statsTableSizeProbeRepository.collect();

      // then
      const actualTableNamesFromDB = await knex('stats_table_size_probes').select('table_name');
      const actualTableNames = actualTableNamesFromDB.map((item) => item['table_name']);
      const pixTableNames = await listAllPixTableNames();
      expect(actualTableNames.length).to.equal(pixTableNames.length);
      expect(actualTableNames).to.deep.include.members(pixTableNames);
    });
  });
});

const { expect, sinon } = require('../../../../test-helper');
const collectDatabaseStatistics = require('../../../../../lib/infrastructure/jobs/collect-database-statistics/job');
const statsTableSizeProbeRepository = require('../../../../../lib/infrastructure/repositories/stats-table-size-probe-repository');

describe('Unit | Infrastructure | Jobs | CollectDatabaseStatistics | Job', () => {

  describe('#collectDatabaseStatistics', () => {

    beforeEach(() => {
      sinon.stub(statsTableSizeProbeRepository, 'collect').resolves();
    });

    afterEach(() => {
      statsTableSizeProbeRepository.collect.restore();
    });

    it('should collect the table sizes', async () => {
      // when
      await collectDatabaseStatistics();

      // then
      expect(statsTableSizeProbeRepository.collect.callCount).to.equal(1);
    });
  });

});

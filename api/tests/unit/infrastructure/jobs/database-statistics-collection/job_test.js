const { expect, sinon } = require('../../../../test-helper');
const collectDatabaseStatistics = require('../../../../../lib/infrastructure/jobs/database-statistics-collection/job');
const statsTableSizeProbeRepository = require('../../../../../lib/infrastructure/repositories/stats-table-size-probe-repository');
const config = require('../../../../../lib/config');

describe('Unit | Infrastructure | Jobs | CollectDatabaseStatistics | Job', () => {

  describe('#collectDatabaseStatistics', () => {

    beforeEach(() => {
      sinon.stub(statsTableSizeProbeRepository, 'collect').resolves();
    });

    afterEach(() => {
      statsTableSizeProbeRepository.collect.restore();
    });

    context('when the version of the job is not the expected version', () => {
      it('should try to retry the job', async () => {
        // given
        const job = { retry: sinon.stub(), data: { version: 'CHARABIA' } };

        // when
        await collectDatabaseStatistics(job);

        // then
        expect(job.retry.callCount).to.equal(1);
      });
    });

    context('when the version of the job is the right version', () => {
      it('should collect the table sizes', async () => {
        // given
        const job = { retry: sinon.stub(), data: { version: config.scheduledJobs.databaseStatisticsCollection.version } };

        // when
        await collectDatabaseStatistics(job);

        // then
        expect(statsTableSizeProbeRepository.collect.callCount).to.equal(1);
      });
    });
  });

});

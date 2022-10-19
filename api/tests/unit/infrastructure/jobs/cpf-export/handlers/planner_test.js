const { expect, sinon } = require('../../../../../test-helper');
const planner = require('../../../../../../lib/infrastructure/jobs/cpf-export/handlers/planner');
const dayjs = require('dayjs');
const { cpf } = require('../../../../../../lib/config');

describe('Unit | Infrastructure | jobs | cpf-export | planner', function () {
  let cpfCertificationResultRepository;
  let pgBoss;

  beforeEach(function () {
    cpfCertificationResultRepository = {
      countByTimeRange: sinon.stub(),
    };
    pgBoss = {
      send: sinon.stub(),
    };
  });

  it('should send to CpfExportBuilderJob chunks of certification course ids', async function () {
    // given
    sinon.stub(cpf.plannerJob, 'chunkSize').value(2);
    sinon.stub(cpf.plannerJob, 'monthsToProcess').value(2);
    sinon.stub(cpf.plannerJob, 'minimumReliabilityPeriod').value(2);

    const startDate = dayjs().utc().subtract(3, 'months').startOf('month').toDate();
    const endDate = dayjs().utc().subtract(2, 'months').endOf('month').toDate();

    cpfCertificationResultRepository.countByTimeRange.resolves(5);

    // when
    await planner({ pgBoss, cpfCertificationResultRepository });

    // then
    expect(cpfCertificationResultRepository.countByTimeRange).to.have.been.calledWith({ startDate, endDate });
    expect(pgBoss.send.firstCall).to.have.been.calledWith('CpfExportBuilderJob', {
      startDate,
      endDate,
      offset: 0,
      limit: 2,
    });
    expect(pgBoss.send.secondCall).to.have.been.calledWith('CpfExportBuilderJob', {
      startDate,
      endDate,
      offset: 2,
      limit: 2,
    });
    expect(pgBoss.send.thirdCall).to.have.been.calledWith('CpfExportBuilderJob', {
      startDate,
      endDate,
      offset: 4,
      limit: 2,
    });
  });
});

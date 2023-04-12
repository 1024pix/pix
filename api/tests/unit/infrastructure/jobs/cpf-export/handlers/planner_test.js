const { expect, sinon } = require('../../../../../test-helper');
const planner = require('../../../../../../lib/infrastructure/jobs/cpf-export/handlers/planner');
const dayjs = require('dayjs');
const { cpf } = require('../../../../../../lib/config');
const utc = require('dayjs/plugin/utc');
const { noop } = require('lodash');
dayjs.extend(utc);

describe('Unit | Infrastructure | jobs | cpf-export | planner', function () {
  let cpfCertificationResultRepository;
  let pgBoss;

  beforeEach(function () {
    cpfCertificationResultRepository = {
      countByTimeRange: sinon.stub(),
      markCertificationToExport: sinon.stub(),
      updateCertificationImportStatus: sinon.stub(),
    };
    pgBoss = {
      insert: sinon.stub(),
    };
  });

  it('should send to CpfExportBuilderJob chunks of certification course ids', async function () {
    // given
    const job = { id: '237584-7648' };
    const logger = { info: noop };
    sinon.stub(cpf.plannerJob, 'chunkSize').value(2);
    sinon.stub(cpf.plannerJob, 'monthsToProcess').value(2);
    sinon.stub(cpf.plannerJob, 'minimumReliabilityPeriod').value(2);

    const startDate = dayjs().utc().subtract(3, 'months').startOf('month').toDate();
    const endDate = dayjs().utc().subtract(2, 'months').endOf('month').toDate();

    cpfCertificationResultRepository.countByTimeRange.resolves(5);

    // when
    await planner({ pgBoss, cpfCertificationResultRepository, logger, job });

    // then
    expect(cpfCertificationResultRepository.markCertificationToExport).to.have.been.callCount(3);
    expect(cpfCertificationResultRepository.markCertificationToExport.getCall(0)).to.have.been.calledWithExactly({
      startDate,
      endDate,
      limit: 2,
      offset: 0,
      batchId: '237584-7648#0',
    });
    expect(cpfCertificationResultRepository.markCertificationToExport.getCall(1)).to.have.been.calledWithExactly({
      startDate,
      endDate,
      limit: 2,
      offset: 2,
      batchId: '237584-7648#1',
    });
    expect(cpfCertificationResultRepository.markCertificationToExport.getCall(2)).to.have.been.calledWithExactly({
      startDate,
      endDate,
      limit: 2,
      offset: 4,
      batchId: '237584-7648#2',
    });
    expect(cpfCertificationResultRepository.countByTimeRange).to.have.been.calledWith({ startDate, endDate });
    expect(pgBoss.insert).to.have.been.calledOnceWith([
      {
        name: 'CpfExportBuilderJob',
        data: {
          batchId: '237584-7648#0',
        },
      },
      {
        name: 'CpfExportBuilderJob',
        data: {
          batchId: '237584-7648#1',
        },
      },
      {
        name: 'CpfExportBuilderJob',
        data: {
          batchId: '237584-7648#2',
        },
      },
    ]);
  });
});

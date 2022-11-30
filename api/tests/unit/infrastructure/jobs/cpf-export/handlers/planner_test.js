const { expect, sinon } = require('../../../../../test-helper');
const planner = require('../../../../../../lib/infrastructure/jobs/cpf-export/handlers/planner');
const { cpfImportStatus } = require('../../../../../../lib/domain/models/CertificationCourse');
const dayjs = require('dayjs');
const { cpf } = require('../../../../../../lib/config');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

describe('Unit | Infrastructure | jobs | cpf-export | planner', function () {
  let cpfCertificationResultRepository;
  let pgBoss;

  beforeEach(function () {
    cpfCertificationResultRepository = {
      getIdsByTimeRange: sinon.stub(),
      markCertificationToExport: sinon.stub(),
      updateCertificationImportStatus: sinon.stub(),
    };
    pgBoss = {
      send: sinon.stub(),
    };
  });

  it('should send to CpfExportBuilderJob chunks of certification course ids', async function () {
    // given
    const jobId = '237584-7648';
    sinon.stub(cpf.plannerJob, 'chunkSize').value(2);
    sinon.stub(cpf.plannerJob, 'monthsToProcess').value(2);
    sinon.stub(cpf.plannerJob, 'minimumReliabilityPeriod').value(2);

    const startDate = dayjs().utc().subtract(3, 'months').startOf('month').toDate();
    const endDate = dayjs().utc().subtract(2, 'months').endOf('month').toDate();

    cpfCertificationResultRepository.getIdsByTimeRange.resolves(['1', '2', '3', '4', '5']);

    // when
    await planner({ pgBoss, cpfCertificationResultRepository, jobId });

    // then
    expect(cpfCertificationResultRepository.markCertificationToExport).to.have.been.callCount(3);
    expect(cpfCertificationResultRepository.markCertificationToExport.getCall(0)).to.have.been.calledWithExactly({
      certificationCourseIds: ['1', '2'],
      batchId: '237584-7648#0',
      cpfImportStatus: cpfImportStatus.PENDING,
    });
    expect(cpfCertificationResultRepository.markCertificationToExport.getCall(1)).to.have.been.calledWithExactly({
      certificationCourseIds: ['3', '4'],
      batchId: '237584-7648#1',
      cpfImportStatus: cpfImportStatus.PENDING,
    });
    expect(cpfCertificationResultRepository.markCertificationToExport.getCall(2)).to.have.been.calledWithExactly({
      certificationCourseIds: ['5'],
      batchId: '237584-7648#2',
      cpfImportStatus: cpfImportStatus.PENDING,
    });
    expect(cpfCertificationResultRepository.getIdsByTimeRange).to.have.been.calledWith({ startDate, endDate });
    expect(pgBoss.send.firstCall).to.have.been.calledWith('CpfExportBuilderJob', {
      jobId: '237584-7648#0',
    });
    expect(pgBoss.send.secondCall).to.have.been.calledWith('CpfExportBuilderJob', {
      jobId: '237584-7648#1',
    });
    expect(pgBoss.send.thirdCall).to.have.been.calledWith('CpfExportBuilderJob', {
      jobId: '237584-7648#2',
    });
  });
});

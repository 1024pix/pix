import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import lodash from 'lodash';

import { CpfExportPlannerJobController } from '../../../../../../src/certification/session-management/application/jobs/cpf-export-planner-job-controller.js';
import { CpfExportBuilderJob } from '../../../../../../src/certification/session-management/domain/models/CpfExportBuilderJob.js';
import { config } from '../../../../../../src/shared/config.js';
import { expect, sinon } from '../../../../../test-helper.js';

const { cpf } = config;
const { noop } = lodash;

dayjs.extend(utc);

describe('Unit | Application | Certification | Sessions Management | jobs | cpf-export-planner-job-controller', function () {
  let cpfCertificationResultRepository;
  let cpfExportBuilderJobRepository;

  beforeEach(function () {
    cpfExportBuilderJobRepository = {
      performAsync: sinon.stub(),
    };
    cpfCertificationResultRepository = {
      countExportableCertificationCoursesByTimeRange: sinon.stub(),
      markCertificationToExport: sinon.stub(),
      updateCertificationImportStatus: sinon.stub(),
    };
  });

  it('should send to CpfExportBuilderJob chunks of certification course ids', async function () {
    // given
    const jobId = '237584-7648';
    const logger = { info: noop };
    sinon.stub(cpf.plannerJob, 'chunkSize').value(2);
    sinon.stub(cpf.plannerJob, 'monthsToProcess').value(2);
    sinon.stub(cpf.plannerJob, 'minimumReliabilityPeriod').value(2);

    const startDate = dayjs().utc().subtract(3, 'months').startOf('month').toDate();
    const endDate = dayjs().utc().subtract(2, 'months').endOf('month').toDate();

    cpfCertificationResultRepository.countExportableCertificationCoursesByTimeRange.resolves(5);

    // when
    const jobController = new CpfExportPlannerJobController();
    await jobController.handle({
      jobId,
      dependencies: { cpfCertificationResultRepository, cpfExportBuilderJobRepository, logger },
    });

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
    expect(
      cpfCertificationResultRepository.countExportableCertificationCoursesByTimeRange,
    ).to.have.been.calledWithExactly({ startDate, endDate });
    expect(cpfExportBuilderJobRepository.performAsync).to.have.been.calledOnceWith(
      new CpfExportBuilderJob({ batchId: '237584-7648#0' }),
      new CpfExportBuilderJob({ batchId: '237584-7648#1' }),
      new CpfExportBuilderJob({ batchId: '237584-7648#2' }),
    );
  });
});

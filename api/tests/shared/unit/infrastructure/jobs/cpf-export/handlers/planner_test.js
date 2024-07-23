import dayjs from 'dayjs';

import { config } from '../../../../../../../src/shared/config.js';
import { planner } from '../../../../../../../src/shared/infrastructure/jobs/cpf-export/handlers/planner.js';
import { expect, sinon } from '../../../../../../test-helper.js';
const { cpf } = config;
import utc from 'dayjs/plugin/utc.js';
import lodash from 'lodash';

const { noop } = lodash;

dayjs.extend(utc);

describe('Unit | Infrastructure | jobs | cpf-export | planner', function () {
  let cpfCertificationResultRepository;
  let pgBoss;

  beforeEach(function () {
    cpfCertificationResultRepository = {
      countExportableCertificationCoursesByTimeRange: sinon.stub(),
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

    cpfCertificationResultRepository.countExportableCertificationCoursesByTimeRange.resolves(5);

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
    expect(
      cpfCertificationResultRepository.countExportableCertificationCoursesByTimeRange,
    ).to.have.been.calledWithExactly({ startDate, endDate });
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

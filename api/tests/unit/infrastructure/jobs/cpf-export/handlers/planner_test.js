const { domainBuilder, expect, sinon } = require('../../../../../test-helper');
const planner = require('../../../../../../lib/infrastructure/jobs/cpf-export/handlers/planner');
const moment = require('moment');
const { cpf } = require('../../../../../../lib/config');

describe('Unit | Infrastructure | jobs | cpf-export | planner', function () {
  let cpfCertificationResultRepository;
  let pgBoss;

  beforeEach(function () {
    cpfCertificationResultRepository = {
      findByTimeRange: sinon.stub(),
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

    const startDate = moment().utc().subtract(3, 'months').startOf('month').toDate();
    const endDate = moment().utc().subtract(2, 'months').endOf('month').toDate();

    const cpfCertificationResults = [
      domainBuilder.buildCpfCertificationResult({ id: 1 }),
      domainBuilder.buildCpfCertificationResult({ id: 2 }),
      domainBuilder.buildCpfCertificationResult({ id: 3 }),
      domainBuilder.buildCpfCertificationResult({ id: 4 }),
      domainBuilder.buildCpfCertificationResult({ id: 5 }),
    ];

    cpfCertificationResultRepository.findByTimeRange.resolves(cpfCertificationResults);

    // when
    await planner({ pgBoss, cpfCertificationResultRepository });

    // then
    expect(cpfCertificationResultRepository.findByTimeRange).to.have.been.calledWith({ startDate, endDate });
    expect(pgBoss.send.firstCall).to.have.been.calledWith('CpfExportBuilderJob', { certificationCourseIds: [1, 2] });
    expect(pgBoss.send.secondCall).to.have.been.calledWith('CpfExportBuilderJob', { certificationCourseIds: [3, 4] });
    expect(pgBoss.send.thirdCall).to.have.been.calledWith('CpfExportBuilderJob', { certificationCourseIds: [5] });
  });
});

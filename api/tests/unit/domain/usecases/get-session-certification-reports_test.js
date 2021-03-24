const { expect, sinon } = require('../../../test-helper');
const certificationReportRepository = require('../../../../lib/infrastructure/repositories/certification-report-repository');
const getSessionCertificationReports = require('../../../../lib/domain/usecases/get-session-certification-reports');

describe('Unit | Domain | Use Cases | get-session-certification-reports', function() {

  const sessionId = 'sessionId';
  const certificationReports = Symbol('some certification candidates');

  beforeEach(function() {
    // given
    sinon.stub(certificationReportRepository, 'findBySessionId').withArgs(sessionId).resolves(certificationReports);
  });

  it('should return the certification reports', async function() {
    // when
    const actualCandidates = await getSessionCertificationReports({ sessionId, certificationReportRepository });

    // then
    expect(actualCandidates).to.equal(certificationReports);
  });

});

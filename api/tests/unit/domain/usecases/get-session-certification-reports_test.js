import { expect, sinon } from '../../../test-helper';
import certificationReportRepository from '../../../../lib/infrastructure/repositories/certification-report-repository';
import getSessionCertificationReports from '../../../../lib/domain/usecases/get-session-certification-reports';

describe('Unit | Domain | Use Cases | get-session-certification-reports', function () {
  it('should return the certification reports', async function () {
    // given
    const sessionId = 'sessionId';
    const certificationReports = Symbol('some certification candidates');
    sinon.stub(certificationReportRepository, 'findBySessionId').withArgs(sessionId).resolves(certificationReports);

    // when
    const actualCandidates = await getSessionCertificationReports({ sessionId, certificationReportRepository });

    // then
    expect(actualCandidates).to.equal(certificationReports);
  });
});

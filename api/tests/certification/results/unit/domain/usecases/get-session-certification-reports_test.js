import { getSessionCertificationReports } from '../../../../../../src/certification/results/domain/usecases/get-session-certification-reports.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Domain | Use Cases | get-session-certification-reports', function () {
  it('should return the certification reports', async function () {
    // given
    const sessionId = 'sessionId';
    const certificationReports = Symbol('some certification candidates');
    const certificationReportRepository = { findBySessionId: sinon.stub() };
    certificationReportRepository.findBySessionId.withArgs({ sessionId }).resolves(certificationReports);

    // when
    const actualCandidates = await getSessionCertificationReports({ sessionId, certificationReportRepository });

    // then
    expect(actualCandidates).to.equal(certificationReports);
  });
});

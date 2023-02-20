import { expect, sinon, domainBuilder } from '../../../test-helper';
import getSessionResults from '../../../../lib/domain/usecases/get-session-results';

describe('Unit | Domain | Use Cases | get-session-results', function () {
  const sessionRepository = { get: null };
  const certificationResultRepository = { findBySessionId: null };

  beforeEach(function () {
    sessionRepository.get = sinon.stub();
    certificationResultRepository.findBySessionId = sinon.stub();
  });

  it('should return the session and the certificationResults', async function () {
    // given
    const expectedSession = domainBuilder.buildSession();
    sessionRepository.get.withArgs(123).resolves(expectedSession);
    const certificationResult1 = domainBuilder.buildCertificationResult({ firstName: 'Buffy' });
    const certificationResult2 = domainBuilder.buildCertificationResult({ firstName: 'Spike' });
    certificationResultRepository.findBySessionId
      .withArgs({ sessionId: 123 })
      .resolves([certificationResult1, certificationResult2]);

    // when
    const { session, certificationResults } = await getSessionResults({
      sessionId: 123,
      sessionRepository,
      certificationResultRepository,
    });

    // then
    expect(session).to.deepEqualInstance(expectedSession);
    expect(certificationResults).to.deepEqualArray([certificationResult1, certificationResult2]);
  });
});

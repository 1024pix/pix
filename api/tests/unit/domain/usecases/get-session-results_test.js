const { expect, sinon, domainBuilder } = require('../../../test-helper');
const getSessionResults = require('../../../../lib/domain/usecases/get-session-results');

describe('Unit | Domain | Use Cases | get-session-results', function() {

  const sessionRepository = { get: null };
  const certificationResultRepository = { findBySessionId: null };

  beforeEach(function() {
    sessionRepository.get = sinon.stub();
    certificationResultRepository.findBySessionId = sinon.stub();
  });

  it('should return the session, the certificationResults and the filename', async function() {
    // given
    const expectedSession = domainBuilder.buildSession({
      date: '2019-06-06',
      time: '12:05:30',
    });
    sessionRepository.get.withArgs(123).resolves(expectedSession);
    const certificationResult1 = domainBuilder.buildCertificationResult2({ firstName: 'Buffy' });
    const certificationResult2 = domainBuilder.buildCertificationResult2({ firstName: 'Spike' });
    certificationResultRepository.findBySessionId.withArgs({ sessionId: 123 }).resolves([certificationResult1, certificationResult2]);

    // when
    const { session, certificationResults, fileName } = await getSessionResults({
      sessionId: 123,
      sessionRepository,
      certificationResultRepository,
    });

    // then
    expect(session).to.deepEqualInstance(expectedSession);
    expect(certificationResults).to.deepEqualArray([certificationResult1, certificationResult2]);
    expect(fileName).to.equal('20190606_1205_resultats_session_123.csv');
  });
});

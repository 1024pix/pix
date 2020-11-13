const { expect, sinon } = require('../../../test-helper');
const getCertificationCandidate = require('../../../../lib/domain/usecases/get-certification-candidate');

describe('Unit | Domain | Use Cases | get-certification-candidate', () => {

  it('should get the certification candidate', async () => {
    // given
    const userId = Symbol('userId');
    const sessionId = Symbol('sessionId');
    const expectedCertificationCandidate = Symbol('certifCandidate');
    const certificationCandidateRepository = {
      getBySessionIdAndUserId: sinon.stub(),
    };
    certificationCandidateRepository.getBySessionIdAndUserId
      .withArgs({ userId, sessionId })
      .resolves(expectedCertificationCandidate);

    // when
    const certificationCandidate = await getCertificationCandidate({ userId, sessionId, certificationCandidateRepository });

    // then
    expect(certificationCandidate).to.equal(expectedCertificationCandidate);
  });
});

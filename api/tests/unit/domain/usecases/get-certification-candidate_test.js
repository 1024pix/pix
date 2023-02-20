import { expect, sinon } from '../../../test-helper';
import getCertificationCandidate from '../../../../lib/domain/usecases/get-certification-candidate';

describe('Unit | Domain | Use Cases | get-certification-candidate', function () {
  it('should get the certification candidate', async function () {
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
    const certificationCandidate = await getCertificationCandidate({
      userId,
      sessionId,
      certificationCandidateRepository,
    });

    // then
    expect(certificationCandidate).to.equal(expectedCertificationCandidate);
  });
});

import { getSessionCertificationCandidates } from '../../../../lib/domain/usecases/get-session-certification-candidates.js';
import { expect, sinon } from '../../../test-helper.js';

describe('Unit | Domain | Use Cases | get-session-certification-candidates', function () {
  const sessionId = 'sessionId';
  const certificationCandidates = 'candidates';
  let certificationCandidateRepository;

  beforeEach(function () {
    // given
    certificationCandidateRepository = { findBySessionId: sinon.stub() };
    certificationCandidateRepository.findBySessionId.withArgs(sessionId).resolves(certificationCandidates);
  });

  it('should return the certification candidates', async function () {
    // when
    const actualCandidates = await getSessionCertificationCandidates({ sessionId, certificationCandidateRepository });

    // then
    expect(actualCandidates).to.equal(certificationCandidates);
  });
});

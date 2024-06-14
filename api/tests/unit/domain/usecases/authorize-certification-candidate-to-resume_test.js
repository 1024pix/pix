import { authorizeCertificationCandidateToResume } from '../../../../lib/domain/usecases/authorize-certification-candidate-to-resume.js';
import { expect, sinon } from '../../../test-helper.js';

describe('Unit | Domain | Use Cases | authorize-certification-candidate-to-resume', function () {
  let certificationCandidateForSupervisingRepository;

  beforeEach(function () {
    certificationCandidateForSupervisingRepository = { authorizeToStart: sinon.stub() };
  });

  it('should authorize the candidate to resume test', async function () {
    // given
    const certificationCandidateId = 1234;

    // when
    await authorizeCertificationCandidateToResume({
      certificationCandidateId,
      certificationCandidateForSupervisingRepository,
    });

    // then
    expect(certificationCandidateForSupervisingRepository.authorizeToStart).to.have.been.calledWithExactly({
      certificationCandidateId,
      authorizedToStart: true,
    });
  });
});

import { authorizeCertificationCandidateToStart } from '../../../../lib/domain/usecases/authorize-certification-candidate-to-start.js';
import { expect, sinon } from '../../../test-helper.js';

describe('Unit | Domain | Use Cases | authorize-certification-candidate-to-start', function () {
  let certificationCandidateForSupervisingRepository;

  beforeEach(function () {
    certificationCandidateForSupervisingRepository = { update: sinon.stub() };
  });

  it('should return the updated certification candidate for supervising', async function () {
    // given, when
    await authorizeCertificationCandidateToStart({
      certificationCandidateForSupervisingId: 123,
      authorizedToStart: false,
      certificationCandidateForSupervisingRepository,
    });

    // then
    expect(certificationCandidateForSupervisingRepository.authorizeToStart).to.have.been.calledWithExactly({
      certificationCandidateId: 123,
      authorizedToStart: false,
    });
  });
});

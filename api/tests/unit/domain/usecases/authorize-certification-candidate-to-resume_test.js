import { domainBuilder, expect, sinon } from '../../../test-helper';
import authorizeCertificationCandidateToResume from '../../../../lib/domain/usecases/authorize-certification-candidate-to-resume';

describe('Unit | Domain | Use Cases | authorize-certification-candidate-to-resume', function () {
  let certificationCandidateForSupervisingRepository;

  beforeEach(function () {
    certificationCandidateForSupervisingRepository = { get: sinon.stub(), update: sinon.stub() };
  });

  it('should authorize the candidate to resume test', async function () {
    // given
    const candidateToUpdate = domainBuilder.buildCertificationCandidateForSupervising({
      authorizedToStart: false,
    });

    certificationCandidateForSupervisingRepository.get.resolves(candidateToUpdate);

    // when
    await authorizeCertificationCandidateToResume({
      certificationCandidateId: 1234,
      certificationCandidateForSupervisingRepository,
    });

    // then
    expect(certificationCandidateForSupervisingRepository.update).to.have.been.calledWith(
      domainBuilder.buildCertificationCandidateForSupervising({
        authorizedToStart: true,
      })
    );
  });
});

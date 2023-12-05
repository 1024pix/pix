import { expect, sinon } from '../../../test-helper.js';
import { authorizeCertificationCandidateToStart } from '../../../../lib/domain/usecases/authorize-certification-candidate-to-start.js';
import { CertificationCandidateForSupervising } from '../../../../src/certification/supervision/domain/models/CertificationCandidateForSupervising.js';

describe('Unit | Domain | Use Cases | authorize-certification-candidate-to-start', function () {
  let certificationCandidateForSupervisingRepository;

  beforeEach(function () {
    certificationCandidateForSupervisingRepository = { update: sinon.stub() };
  });

  it('should return the updated certification candidate for supervising', async function () {
    // given
    const updatedCertificationCandidateForSupervising = new CertificationCandidateForSupervising({
      id: 1234,
      firstName: 'toto',
      lastName: 'tutu',
      birthdate: '2020-01-01',
      extraTimePercentage: 0.5,
      authorizedToStart: true,
    });

    // when
    await authorizeCertificationCandidateToStart({
      certificationCandidateForSupervisingId: 1234,
      authorizedToStart: true,
      certificationCandidateForSupervisingRepository,
    });

    // then
    expect(certificationCandidateForSupervisingRepository.update).to.have.been.calledWithExactly({
      id: updatedCertificationCandidateForSupervising.id,
      authorizedToStart: updatedCertificationCandidateForSupervising.authorizedToStart,
    });
  });
});

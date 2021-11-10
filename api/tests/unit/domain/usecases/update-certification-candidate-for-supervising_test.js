const { expect, sinon } = require('../../../test-helper');
const updateCertificationCandidateForSupervising = require('../../../../lib/domain/usecases/update-certification-candidate-for-supervising');
const CertificationCandidateForSupervising = require('../../../../lib/domain/models/CertificationCandidateForSupervising');

describe('Unit | Domain | Use Cases | update-certification-candidate-for-supervising', function () {
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
    await updateCertificationCandidateForSupervising({
      certificationCandidateForSupervisingId: 1234,
      authorizedToStart: true,
      certificationCandidateForSupervisingRepository,
    });

    // then
    expect(certificationCandidateForSupervisingRepository.update).to.have.been.calledWith({
      id: updatedCertificationCandidateForSupervising.id,
      authorizedToStart: updatedCertificationCandidateForSupervising.authorizedToStart,
    });
  });
});

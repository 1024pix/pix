import { expect, sinon, domainBuilder, catchErr } from '../../../test-helper';
import { NotFoundError } from '../../../../lib/domain/errors';
import get from '../../../../lib/domain/usecases/certificate/get-certification-attestation';

describe('Unit | UseCase | get-certification-attestation', function () {
  const certificateRepository = {
    getCertificationAttestation: () => undefined,
  };

  const dependencies = {
    certificateRepository,
  };

  beforeEach(function () {
    certificateRepository.getCertificationAttestation = sinon.stub();
  });

  context('when the user is not owner of the certification attestation', function () {
    it('should throw an error if user is not the owner of the certificationAttestation', async function () {
      // given
      const certificationAttestation = domainBuilder.buildCertificationAttestation({
        id: 123,
        userId: 456,
      });
      certificateRepository.getCertificationAttestation.withArgs(123).resolves(certificationAttestation);

      // when
      const error = await catchErr(get)({ certificationId: 123, userId: 789, ...dependencies });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  context('when the user is owner of the certification attestation', function () {
    it('should return the certification attestation enhanced with result competence tree', async function () {
      // given
      const resultCompetenceTree = domainBuilder.buildResultCompetenceTree({ id: 'myResultTreeId' });
      const certificationAttestation = domainBuilder.buildCertificationAttestation({
        id: 123,
        userId: 456,
        resultCompetenceTree,
      });
      certificateRepository.getCertificationAttestation.withArgs(123).resolves(certificationAttestation);

      // when
      const actualCertificationAttestation = await get({ certificationId: 123, userId: 456, ...dependencies });

      // then
      const expectedCertificationAttestation = domainBuilder.buildCertificationAttestation({
        id: 123,
        userId: 456,
        resultCompetenceTree,
      });
      expect(actualCertificationAttestation).to.deep.equal(expectedCertificationAttestation);
    });
  });
});

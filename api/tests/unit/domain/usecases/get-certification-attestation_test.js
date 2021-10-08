const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const { NotFoundError } = require('../../../../lib/domain/errors');
const get = require('../../../../lib/domain/usecases/certificate/get-certification-attestation');

describe('Unit | UseCase | get-certification-attestation', function () {
  const certificationAttestationRepository = {
    get: () => undefined,
  };

  const dependencies = {
    certificationAttestationRepository,
  };

  beforeEach(function () {
    certificationAttestationRepository.get = sinon.stub();
  });

  context('when the user is not owner of the certification attestation', function () {
    it('should throw an error if user is not the owner of the certificationAttestation', async function () {
      // given
      const certificationAttestation = domainBuilder.buildCertificationAttestation({
        id: 123,
        userId: 456,
      });
      certificationAttestationRepository.get.withArgs(123).resolves(certificationAttestation);

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
      certificationAttestationRepository.get.withArgs(123).resolves(certificationAttestation);

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

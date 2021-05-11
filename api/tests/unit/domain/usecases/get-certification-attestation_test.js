const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const { NotFoundError } = require('../../../../lib/domain/errors');
const get = require('../../../../lib/domain/usecases/certificate/get-certification-attestation');

describe('Unit | UseCase | get', async () => {

  const certificationAttestationRepository = {
    get: () => undefined,
  };
  const resultCompetenceTreeService = {
    computeForCertification: () => undefined,
  };
  const assessmentResultRepository = 'assessmentResultRepository';
  const competenceTreeRepository = 'assessmentResultRepository';
  const dependencies = {
    certificationAttestationRepository,
    resultCompetenceTreeService,
    assessmentResultRepository,
    competenceTreeRepository,
  };

  beforeEach(() => {
    certificationAttestationRepository.get = sinon.stub();
    resultCompetenceTreeService.computeForCertification = sinon.stub();
  });

  context('when the user is not owner of the certification attestation', async () => {

    it('should throw an error if user is not the owner of the certificationAttestation', async () => {
      // given
      const certificationAttestation = domainBuilder.buildCertificationAttestation({
        id: 123,
        userId: 456,
      });
      certificationAttestationRepository.get.withArgs(123).resolves(certificationAttestation);
      resultCompetenceTreeService.computeForCertification.throws(new Error('I should not be called'));

      // when
      const error = await catchErr(get)({ certificationId: 123, userId: 789, ...dependencies });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  context('when the user is owner of the certification attestation', async () => {

    it('should return the certification attestation enhanced with result competence tree', async () => {
      // given
      const certificationAttestation = domainBuilder.buildCertificationAttestation({
        id: 123,
        userId: 456,
      });
      const resultCompetenceTree = domainBuilder.buildResultCompetenceTree({ id: 'myResultTreeId' });
      certificationAttestationRepository.get.withArgs(123).resolves(certificationAttestation);
      resultCompetenceTreeService.computeForCertification
        .withArgs({
          certificationId: 123,
          assessmentResultRepository,
          competenceTreeRepository,
        })
        .resolves(resultCompetenceTree);

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

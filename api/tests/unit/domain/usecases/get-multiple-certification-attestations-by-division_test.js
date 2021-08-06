const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const getMultipleCertificationAttestationsByDivision = require('../../../../lib/domain/usecases/certificate/get-multiple-certification-attestations-by-division');
const { NoCertificationAttestationForDivisionError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | get-multiple-certification-attestations-by-division', async () => {

  const certificationAttestationRepository = {
    findByDivisionForScoIsManagingStudentsOrganization: () => undefined,
  };
  const resultCompetenceTreeService = {
    computeForCertification: () => undefined,
  };

  const dependencies = {
    certificationAttestationRepository,
  };

  beforeEach(() => {
    certificationAttestationRepository.findByDivisionForScoIsManagingStudentsOrganization = sinon.stub();
    resultCompetenceTreeService.computeForCertification = sinon.stub();
  });

  it('should return multiple certification attestations enhanced with result competence tree', async () => {
    // given
    const resultCompetenceTree1 = domainBuilder.buildResultCompetenceTree({ id: 'firstResultTreeId' });
    const resultCompetenceTree2 = domainBuilder.buildResultCompetenceTree({ id: 'secondResultTreeId' });

    const certificationAttestation1 = domainBuilder.buildCertificationAttestation({
      id: 123,
      userId: 123,
      certificationCenter: 'Lycée Tardis',
      resultCompetenceTree: resultCompetenceTree1,
    });

    const certificationAttestation2 = domainBuilder.buildCertificationAttestation({
      id: 456,
      userId: 456,
      certificationCenter: 'Lycée Tardis',
      resultCompetenceTree: resultCompetenceTree2,
    });

    certificationAttestationRepository.findByDivisionForScoIsManagingStudentsOrganization.withArgs({ organizationId: 1234, division: '3b' }).resolves([certificationAttestation1, certificationAttestation2]);

    // when
    const actualCertificationAttestations = await getMultipleCertificationAttestationsByDivision({ organizationId: 1234, division: '3b', ...dependencies });

    // then
    const expectedCertificationAttestations = [
      domainBuilder.buildCertificationAttestation({
        id: certificationAttestation1.id,
        userId: certificationAttestation1.userId,
        certificationCenter: 'Lycée Tardis',
        resultCompetenceTree: resultCompetenceTree1,
      }),
      domainBuilder.buildCertificationAttestation({
        id: certificationAttestation2.id,
        userId: certificationAttestation2.userId,
        certificationCenter: 'Lycée Tardis',
        resultCompetenceTree: resultCompetenceTree2,
      }),
    ];

    expect(actualCertificationAttestations).to.deep.equal(expectedCertificationAttestations);
  });

  describe('when there is no attestation', () => {
    it('should throw a NoCertificationAttestationForDivisionError', async () => {
      // given
      certificationAttestationRepository.findByDivisionForScoIsManagingStudentsOrganization.withArgs({ organizationId: 1234, division: '3b' }).resolves([]);

      // when
      const error = await catchErr(getMultipleCertificationAttestationsByDivision)({ organizationId: 1234, division: '3b', ...dependencies });

      // then
      expect(error).to.be.an.instanceOf(NoCertificationAttestationForDivisionError);
    });
  });
});

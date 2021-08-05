const { expect, sinon, domainBuilder } = require('../../../test-helper');
const getMultipleCertificationAttestationsByDivision = require('../../../../lib/domain/usecases/certificate/get-multiple-certification-attestations-by-division');

describe('Unit | UseCase | get-multiple-certification-attestations-by-division', async () => {

  const certificationAttestationRepository = {
    findByDivisionForScoIsManagingStudentsOrganization: () => undefined,
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
    certificationAttestationRepository.findByDivisionForScoIsManagingStudentsOrganization = sinon.stub();
    resultCompetenceTreeService.computeForCertification = sinon.stub();
  });

  it('should return multiple certification attestations enhanced with result competence tree', async () => {
    // given
    const certificationAttestation1 = domainBuilder.buildCertificationAttestation({
      id: 123,
      userId: 123,
      certificationCenter: 'Lycée Tardis',
    });

    const certificationAttestation2 = domainBuilder.buildCertificationAttestation({
      id: 456,
      userId: 456,
      certificationCenter: 'Lycée Tardis',
    });

    const resultCompetenceTree1 = domainBuilder.buildResultCompetenceTree({ id: 'firstResultTreeId' });
    const resultCompetenceTree2 = domainBuilder.buildResultCompetenceTree({ id: 'secondResultTreeId' });

    certificationAttestationRepository.findByDivisionForScoIsManagingStudentsOrganization.withArgs({ organizationId: 1234, division: '3b' }).resolves([certificationAttestation1, certificationAttestation2]);

    resultCompetenceTreeService.computeForCertification
      .onCall(0)
      .resolves(resultCompetenceTree1);

    resultCompetenceTreeService.computeForCertification
      .onCall(1)
      .resolves(resultCompetenceTree2);

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
});

const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const findCertificationAttestationsForDivision = require('../../../../lib/domain/usecases/certificate/find-certification-attestations-for-division');
const { NoCertificationAttestationForDivisionError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | find-certification-attestations-for-division', function () {
  const certificateRepository = {
    findByDivisionForScoIsManagingStudentsOrganization: () => undefined,
  };

  const dependencies = {
    certificateRepository,
  };

  beforeEach(function () {
    certificateRepository.findByDivisionForScoIsManagingStudentsOrganization = sinon.stub();
  });

  it('should return multiple certification attestations enhanced with result competence tree', async function () {
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

    certificateRepository.findByDivisionForScoIsManagingStudentsOrganization
      .withArgs({ organizationId: 1234, division: '3b' })
      .resolves([certificationAttestation1, certificationAttestation2]);

    // when
    const actualCertificationAttestations = await findCertificationAttestationsForDivision({
      organizationId: 1234,
      division: '3b',
      ...dependencies,
    });

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

  describe('when there is no attestation', function () {
    it('should throw a NoCertificationAttestationForDivisionError', async function () {
      // given
      certificateRepository.findByDivisionForScoIsManagingStudentsOrganization
        .withArgs({ organizationId: 1234, division: '3b' })
        .resolves([]);

      // when
      const error = await catchErr(findCertificationAttestationsForDivision)({
        organizationId: 1234,
        division: '3b',
        ...dependencies,
      });

      // then
      expect(error).to.be.an.instanceOf(NoCertificationAttestationForDivisionError);
    });
  });
});

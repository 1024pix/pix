import sinon from 'sinon';

import { findCertificatesForDivision } from '../../../../../../src/certification/results/domain/usecases/find-certificates-for-division.js';
import { NoCertificateForDivisionError } from '../../../../../../src/shared/domain/errors.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | UseCase | find-certification-attestations-for-division', function () {
  let certificateRepository;

  beforeEach(function () {
    certificateRepository = { findByDivisionForScoIsManagingStudentsOrganization: sinon.stub() };
  });

  it('should return multiple certification attestations enhanced with result competence tree', async function () {
    // given
    const locale = 'fr';
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
      .withArgs({ organizationId: 1234, division: '3b', locale })
      .resolves([certificationAttestation1, certificationAttestation2]);

    // when
    const actualCertificationAttestations = await findCertificatesForDivision({
      organizationId: 1234,
      division: '3b',
      locale,
      certificateRepository,
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
    it('should throw a NoCertificateForDivisionError', async function () {
      // given
      const locale = 'fr';
      certificateRepository.findByDivisionForScoIsManagingStudentsOrganization
        .withArgs({ organizationId: 1234, division: '3b', locale })
        .resolves([]);

      // when
      const error = await catchErr(findCertificatesForDivision)({
        organizationId: 1234,
        division: '3b',
        locale,
        certificateRepository,
      });

      // then
      expect(error).to.be.an.instanceOf(NoCertificateForDivisionError);
    });
  });
});

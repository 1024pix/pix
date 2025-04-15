import { getCertificationAttestation } from '../../../../../../src/certification/results/domain/usecases/get-certification-attestation.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | get-certification-attestation', function () {
  let certificateRepository, certificationCourseRepository;

  beforeEach(function () {
    certificateRepository = { getCertificationAttestation: sinon.stub() };
    certificationCourseRepository = { get: sinon.stub() };
  });

  it('should return the certification attestation enhanced with result competence tree', async function () {
    // given
    const resultCompetenceTree = domainBuilder.buildResultCompetenceTree({ id: 'myResultTreeId' });
    const certificationAttestation = domainBuilder.buildCertificationAttestation({
      id: 123,
      resultCompetenceTree,
    });
    const certificationCourse = domainBuilder.buildCertificationCourse({ id: 123 });
    certificationCourseRepository.get.withArgs({ id: 123 }).resolves(certificationCourse);
    certificateRepository.getCertificationAttestation
      .withArgs({ certificationCourseId: 123 })
      .resolves(certificationAttestation);

    // when
    const actualCertificationAttestation = await getCertificationAttestation({
      certificationCourseId: 123,
      certificateRepository,
      certificationCourseRepository,
    });

    // then
    const expectedCertificationAttestation = domainBuilder.buildCertificationAttestation({
      id: 123,
      resultCompetenceTree,
    });
    expect(actualCertificationAttestation).to.deep.equal(expectedCertificationAttestation);
  });
});

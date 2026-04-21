import sinon from 'sinon';

import { getCertificate } from '../../../../../../src/certification/results/domain/usecases/get-certificate.js';

import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | UseCase | get-certificate', function () {
  it('should return the certificate enhanced with result competence tree', async function () {
    // given
    const locale = 'fr';
    const certificateRepository = { getCertificate: sinon.stub() };
    const resultCompetenceTree = domainBuilder.buildResultCompetenceTree({ id: 'myResultTreeId' });
    const certificationAttestation = domainBuilder.buildCertificationAttestation({
      id: 123,
      resultCompetenceTree,
    });
    domainBuilder.buildCertificationCourse({ id: 123 });
    certificateRepository.getCertificate
      .withArgs({ certificationCourseId: 123, locale })
      .resolves(certificationAttestation);

    // when
    const actualCertificate = await getCertificate({
      certificationCourseId: 123,
      locale,
      certificateRepository,
    });

    // then
    const expectedCertificate = domainBuilder.buildCertificationAttestation({
      id: 123,
      resultCompetenceTree,
    });
    expect(actualCertificate).to.deep.equal(expectedCertificate);
  });
});

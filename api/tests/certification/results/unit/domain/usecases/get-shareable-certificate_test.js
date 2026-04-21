import sinon from 'sinon';

import { getShareableCertificate } from '../../../../../../src/certification/results/domain/usecases/get-shareable-certificate.js';

import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Results | Unit | Domain | UseCases | get-shareable-certificate', function () {
  const certificateRepository = {
    getShareableCertificate: () => undefined,
  };

  beforeEach(function () {
    certificateRepository.getShareableCertificate = sinon.stub();
  });

  it('should return certification from verification code enhanced with resultCompetenceTree', async function () {
    // given
    const resultCompetenceTree = domainBuilder.buildResultCompetenceTree();
    const certificationCourseId = domainBuilder.buildCertificationCourse().id;
    const shareableCertificate = domainBuilder.buildShareableCertificate({
      id: 1,
      verificationCode: 'P-123456CC',
      resultCompetenceTree,
    });
    const locale = 'fr';
    certificateRepository.getShareableCertificate
      .withArgs({ certificationCourseId, locale })
      .resolves(shareableCertificate);

    // when
    const finalShareableCertificate = await getShareableCertificate({
      certificationCourseId,
      locale,
      certificateRepository,
    });

    // then
    const expectedShareableCertificate = domainBuilder.buildShareableCertificate({
      id: 1,
      verificationCode: 'P-123456CC',
      resultCompetenceTree,
    });
    expect(finalShareableCertificate).to.be.deep.equal(expectedShareableCertificate);
  });
});

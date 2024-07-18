import { getShareableCertificate as getCertificationByVerificationCode } from '../../../../../../src/certification/results/domain/usecases/get-shareable-certificate.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Results | Unit | Domain | UseCases | get-shareable-certificate', function () {
  const certificateRepository = {
    getShareableCertificateByVerificationCode: () => undefined,
  };

  beforeEach(function () {
    certificateRepository.getShareableCertificateByVerificationCode = sinon.stub();
  });

  it('should return certification from verification code enhanced with resultCompetenceTree', async function () {
    // given
    const resultCompetenceTree = domainBuilder.buildResultCompetenceTree();
    const shareableCertificate = domainBuilder.buildShareableCertificate({
      id: 1,
      verificationCode: 'P-123456CC',
      resultCompetenceTree,
    });
    const locale = 'fr';
    certificateRepository.getShareableCertificateByVerificationCode
      .withArgs('P-123456CC', { locale })
      .resolves(shareableCertificate);

    // when
    const finalShareableCertificate = await getCertificationByVerificationCode({
      verificationCode: 'P-123456CC',
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

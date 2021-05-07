const { expect, sinon, domainBuilder } = require('../../../test-helper');
const getCertificationByVerificationCode = require('../../../../lib/domain/usecases/certificate/get-shareable-certificate');

describe('Unit | UseCase | get-shareable-certificate', () => {

  const shareableCertificateRepository = {
    getByVerificationCode: () => undefined,
  };
  const resultCompetenceTreeService = {
    computeForCertification: () => undefined,
  };
  const assessmentResultRepository = 'assessmentResultRepository';
  const competenceTreeRepository = 'competenceTreeRepository';

  beforeEach(() => {
    shareableCertificateRepository.getByVerificationCode = sinon.stub();
    resultCompetenceTreeService.computeForCertification = sinon.stub();
  });

  it('should return certification from verification code enhanced with resultCompetenceTree', async () => {
    // given
    const shareableCertificate = domainBuilder.buildShareableCertificate({
      id: 1,
      verificationCode: 'P-123456CC',
      resultCompetenceTree: null,
    });
    shareableCertificateRepository.getByVerificationCode
      .withArgs({ verificationCode: 'P-123456CC' })
      .resolves(shareableCertificate);
    const resultCompetenceTree = domainBuilder.buildResultCompetenceTree();
    resultCompetenceTreeService.computeForCertification
      .withArgs({
        certificationId: 1,
        assessmentResultRepository,
        competenceTreeRepository,
      })
      .resolves(resultCompetenceTree);

    // when
    const finalShareableCertificate = await getCertificationByVerificationCode({
      verificationCode: 'P-123456CC',
      shareableCertificateRepository,
      assessmentResultRepository,
      competenceTreeRepository,
      resultCompetenceTreeService,
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

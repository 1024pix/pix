const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const getCertificationByVerificationCode = require('../../../../lib/domain/usecases/certificate/get-shareable-certificate');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | get-shareable-certificate', () => {

  let certificationRepository;
  let assessmentResultRepository;
  let competenceTreeRepository;
  let cleaCertificationResultRepository;

  beforeEach(() => {
    certificationRepository = { getCertificationByVerificationCode: sinon.stub() };
    assessmentResultRepository = { findLatestByCertificationCourseIdWithCompetenceMarks: sinon.stub() };
    competenceTreeRepository = { get: sinon.stub() };
    cleaCertificationResultRepository = { get: sinon.stub() };
  });

  it('should return certification from verification code', async () => {
    // given
    const verificationCode = 'P-123456CC';
    const certificationCourseId = 1;
    const certificateWithoutCleaAndCompetenceTree = domainBuilder.buildShareableCertificate({
      id: certificationCourseId,
      verificationCode,
      cleaCertificationStatus: null,
      resultCompetenceTree: null,
    });
    const cleaCertificationResult = domainBuilder.buildCleaCertificationResult.notPassed();
    const assessmentResultId = 1;
    const competenceTree = { areas: [] };
    const competenceMarks = [];
    certificationRepository.getShareableCertificateByVerificationCode = sinon.stub().withArgs({ verificationCode }).resolves(certificateWithoutCleaAndCompetenceTree);
    cleaCertificationResultRepository.get = sinon.stub().withArgs(certificateWithoutCleaAndCompetenceTree).resolves(cleaCertificationResult);
    assessmentResultRepository.findLatestByCertificationCourseIdWithCompetenceMarks = sinon.stub().withArgs({ certificationCourseId }).resolves({ id: assessmentResultId, competenceMarks });
    competenceTreeRepository.get = sinon.stub().resolves(competenceTree);

    // when
    const result = await getCertificationByVerificationCode({
      verificationCode,
      certificationRepository,
      cleaCertificationResultRepository,
      assessmentResultRepository,
      competenceTreeRepository,
    });

    // then
    const expectedCertification = {
      ...certificateWithoutCleaAndCompetenceTree,
      cleaCertificationResult,
      resultCompetenceTree: { areas: [], id: '1-1' },
    };
    expect(result).to.be.deep.equal(expectedCertification);
  });

  it('should fail if verificationCode does not belong to any certificate', async () => {
    // given
    const verificationCode = 'P-123456OO';
    const thrownError = new NotFoundError();
    certificationRepository.getShareableCertificateByVerificationCode = sinon.stub().withArgs({ verificationCode }).rejects(thrownError);

    // when
    const error = await catchErr(getCertificationByVerificationCode)({
      verificationCode,
      certificationRepository,
      cleaCertificationResultRepository,
      assessmentResultRepository,
      competenceTreeRepository,
    });

    // then
    expect(error).to.equal(thrownError);
  });
});

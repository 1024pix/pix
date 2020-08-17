const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const getCertificationByVerificationCode = require('../../../../lib/domain/usecases/certificate/get-shareable-certificate');
const { UserNotAuthorizedToAccessEntity, NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | get-shareable-certificate', () => {

  let certificationRepository;
  let assessmentResultRepository;
  let competenceTreeRepository;
  let cleaCertificationStatusRepository;

  beforeEach(() => {
    certificationRepository = { getCertificationByVerificationCode: sinon.stub() };
    assessmentResultRepository = { findLatestByCertificationCourseIdWithCompetenceMarks: sinon.stub() };
    competenceTreeRepository = { get: sinon.stub() };
    cleaCertificationStatusRepository = { getCleaCertificationStatus: sinon.stub() };
  });

  it('should return certification from pixScore and verification code', async () => {
    // given
    const pixScore = 500;
    const verificationCode = 'P-123456';
    const certificationCourseId = 1;
    const certificateWithoutCleaAndCompetenceTree = domainBuilder.buildShareableCertificate({
      id: certificationCourseId,
      verificationCode,
      cleaCertificationStatus: null,
      resultCompetenceTree: null,
      pixScore
    });
    const cleaCertificationStatus = 'not_passed';
    const assessmentResultId = 1;
    const competenceTree = { areas: [] };
    const competenceMarks = [];
    certificationRepository.getShareableCertificateByVerificationCode = sinon.stub().withArgs({ verificationCode }).resolves(certificateWithoutCleaAndCompetenceTree);
    cleaCertificationStatusRepository.getCleaCertificationStatus = sinon.stub().withArgs(certificateWithoutCleaAndCompetenceTree).resolves(cleaCertificationStatus);
    assessmentResultRepository.findLatestByCertificationCourseIdWithCompetenceMarks = sinon.stub().withArgs({ certificationCourseId }).resolves({ id: assessmentResultId, competenceMarks });
    competenceTreeRepository.get = sinon.stub().resolves(competenceTree);

    // when
    const result = await getCertificationByVerificationCode({
      pixScore,
      verificationCode,
      certificationRepository,
      cleaCertificationStatusRepository,
      assessmentResultRepository,
      competenceTreeRepository
    });

    // then
    const expectedCertification = {
      ...certificateWithoutCleaAndCompetenceTree,
      cleaCertificationStatus,
      resultCompetenceTree: { areas: [], id: '1-1' }
    };
    expect(result).to.be.deep.equal(expectedCertification);
  });

  it('should reject if pixScore does not match', async () => {
    // given
    const actualPixScore = 500;
    const inputPixScore = 600;
    const verificationCode = 'P-123456';
    const certificationCourseId = 1;
    const certificateWithoutCleaAndCompetenceTree = domainBuilder.buildShareableCertificate({
      id: certificationCourseId,
      verificationCode,
      cleaCertificationStatus: null,
      resultCompetenceTree: null,
      pixScore: actualPixScore
    });
    certificationRepository.getShareableCertificateByVerificationCode = sinon.stub().withArgs({ verificationCode }).resolves(certificateWithoutCleaAndCompetenceTree);

    // when
    const error = await catchErr(getCertificationByVerificationCode)({
      pixScore: inputPixScore,
      verificationCode,
      certificationRepository,
      cleaCertificationStatusRepository,
      assessmentResultRepository,
      competenceTreeRepository
    });

    // then
    expect(error).to.be.an.instanceOf(UserNotAuthorizedToAccessEntity);
  });

  it('should fail if verificationCode does not belong to any certificate', async () => {
    // given
    const verificationCode = 'P-123456';
    const thrownError = new NotFoundError();
    certificationRepository.getShareableCertificateByVerificationCode = sinon.stub().withArgs({ verificationCode }).rejects(thrownError);

    // when
    const error = await catchErr(getCertificationByVerificationCode)({
      pixScore: 500,
      verificationCode,
      certificationRepository,
      cleaCertificationStatusRepository,
      assessmentResultRepository,
      competenceTreeRepository
    });

    // then
    expect(error).to.equal(thrownError);
  });
});

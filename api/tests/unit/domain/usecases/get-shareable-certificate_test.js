const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const getCertificationByVerificationCode = require('../../../../lib/domain/usecases/certificate/get-shareable-certificate');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | get-shareable-certificate', function() {

  let certificationRepository;
  let assessmentResultRepository;
  let competenceTreeRepository;
  let cleaCertificationStatusRepository;

  beforeEach(function() {
    certificationRepository = { getCertificationByVerificationCode: sinon.stub() };
    assessmentResultRepository = { findLatestByCertificationCourseIdWithCompetenceMarks: sinon.stub() };
    competenceTreeRepository = { get: sinon.stub() };
    cleaCertificationStatusRepository = { getCleaCertificationStatus: sinon.stub() };
  });

  it('should return certification from verification code', async function() {
    // given
    const verificationCode = 'P-123456CC';
    const certificationCourseId = 1;
    const certificateWithoutCleaAndCompetenceTree = domainBuilder.buildShareableCertificate({
      id: certificationCourseId,
      verificationCode,
      cleaCertificationStatus: null,
      resultCompetenceTree: null,
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
      verificationCode,
      certificationRepository,
      cleaCertificationStatusRepository,
      assessmentResultRepository,
      competenceTreeRepository,
    });

    // then
    const expectedCertification = {
      ...certificateWithoutCleaAndCompetenceTree,
      cleaCertificationStatus,
      resultCompetenceTree: { areas: [], id: '1-1' },
    };
    expect(result).to.be.deep.equal(expectedCertification);
  });

  it('should fail if verificationCode does not belong to any certificate', async function() {
    // given
    const verificationCode = 'P-123456OO';
    const thrownError = new NotFoundError();
    certificationRepository.getShareableCertificateByVerificationCode = sinon.stub().withArgs({ verificationCode }).rejects(thrownError);

    // when
    const error = await catchErr(getCertificationByVerificationCode)({
      verificationCode,
      certificationRepository,
      cleaCertificationStatusRepository,
      assessmentResultRepository,
      competenceTreeRepository,
    });

    // then
    expect(error).to.equal(thrownError);
  });
});

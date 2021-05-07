const { expect, sinon, domainBuilder } = require('../../../test-helper');
const getCertificationByVerificationCode = require('../../../../lib/domain/usecases/certificate/get-shareable-certificate');

describe('Unit | UseCase | get-shareable-certificate', () => {

  let shareableCertificateRepository;
  let assessmentResultRepository;
  let competenceTreeRepository;
  let cleaCertificationStatusRepository;

  beforeEach(() => {
    shareableCertificateRepository = { getByVerificationCode: sinon.stub() };
    assessmentResultRepository = { findLatestByCertificationCourseIdWithCompetenceMarks: sinon.stub() };
    competenceTreeRepository = { get: sinon.stub() };
    cleaCertificationStatusRepository = { getCleaCertificationStatus: sinon.stub() };
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
    const cleaCertificationStatus = 'not_passed';
    const assessmentResultId = 1;
    const competenceTree = { areas: [] };
    const competenceMarks = [];
    shareableCertificateRepository.getByVerificationCode = sinon.stub().withArgs({ verificationCode }).resolves(certificateWithoutCleaAndCompetenceTree);
    cleaCertificationStatusRepository.getCleaCertificationStatus = sinon.stub().withArgs(certificateWithoutCleaAndCompetenceTree).resolves(cleaCertificationStatus);
    assessmentResultRepository.findLatestByCertificationCourseIdWithCompetenceMarks = sinon.stub().withArgs({ certificationCourseId }).resolves({ id: assessmentResultId, competenceMarks });
    competenceTreeRepository.get = sinon.stub().resolves(competenceTree);

    // when
    const result = await getCertificationByVerificationCode({
      verificationCode,
      shareableCertificateRepository,
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
});

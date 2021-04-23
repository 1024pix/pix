const { sinon, expect, domainBuilder } = require('../../../test-helper');
const CertificationResultInformation = require('../../../../lib/domain/read-models/CertificationResultInformation');
const getCertificationResultInformation = require('../../../../lib/domain/usecases/get-certification-result-information');

describe('Unit | Usecase | get-certification-result-information', () => {

  it('should get the certificationResultInformation', async () => {
    // given
    const certificationCourseId = 777;

    const generalCertificationInformationRepository = { get: sinon.stub() };
    const generalCertificationInformation = {};
    generalCertificationInformationRepository.get
      .withArgs({ certificationCourseId }).resolves(generalCertificationInformation);

    const assessmentResultRepository = { getByCertificationCourseId: sinon.stub() };
    const assessmentResult = {};
    assessmentResultRepository.getByCertificationCourseId
      .withArgs({ certificationCourseId }).resolves(assessmentResult);

    const cleaCertificationResultRepository = { get: sinon.stub() };
    const cleaCertificationResult = domainBuilder.buildCleaCertificationResult.notTaken();
    cleaCertificationResultRepository.get
      .withArgs({ certificationCourseId })
      .resolves(cleaCertificationResult);

    const pixPlusDroitMaitreCertificationResultRepository = { get: sinon.stub() };
    const pixPlusDroitMaitreCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.maitre.acquired();
    pixPlusDroitMaitreCertificationResultRepository.get
      .withArgs({ certificationCourseId })
      .resolves(pixPlusDroitMaitreCertificationResult);

    const pixPlusDroitExpertCertificationResultRepository = { get: sinon.stub() };
    const pixPlusDroitExpertCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.rejected();
    pixPlusDroitExpertCertificationResultRepository.get
      .withArgs({ certificationCourseId })
      .resolves(pixPlusDroitExpertCertificationResult);

    const certificationResultInformation = Symbol('Certification result information');
    sinon.stub(CertificationResultInformation, 'from')
      .withArgs({
        generalCertificationInformation,
        assessmentResult,
        cleaCertificationResult,
        pixPlusDroitMaitreCertificationResult,
        pixPlusDroitExpertCertificationResult,
      })
      .resolves(certificationResultInformation);

    // when
    const result = await getCertificationResultInformation({
      certificationCourseId,
      generalCertificationInformationRepository,
      assessmentResultRepository,
      cleaCertificationResultRepository,
      pixPlusDroitMaitreCertificationResultRepository,
      pixPlusDroitExpertCertificationResultRepository,
    });

    // then
    expect(result).to.be.equal(certificationResultInformation);
  });
});

const { sinon, expect, domainBuilder } = require('../../../test-helper');
const JuryCertification = require('../../../../lib/domain/models/JuryCertification');
const getJuryCertification = require('../../../../lib/domain/usecases/get-jury-certification');

describe('Unit | Usecase | get-jury-certification', function() {

  it('should get the jury certification', async function() {
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

    const juryCertification = Symbol('Jury Certification');
    sinon.stub(JuryCertification, 'from')
      .withArgs({
        generalCertificationInformation,
        assessmentResult,
        cleaCertificationResult,
        pixPlusDroitMaitreCertificationResult,
        pixPlusDroitExpertCertificationResult,
      })
      .resolves(juryCertification);

    // when
    const result = await getJuryCertification({
      certificationCourseId,
      generalCertificationInformationRepository,
      assessmentResultRepository,
      cleaCertificationResultRepository,
      pixPlusDroitMaitreCertificationResultRepository,
      pixPlusDroitExpertCertificationResultRepository,
    });

    // then
    expect(result).to.be.equal(juryCertification);
  });
});

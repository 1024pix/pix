const { sinon, expect } = require('../../../test-helper');
const CertificationResultInformation = require('../../../../lib/domain/read-models/CertificationResultInformation');
const { statuses: cleaStatuses } = require('../../../../lib/infrastructure/repositories/clea-certification-status-repository');
const getCertificationResultInformation = require('../../../../lib/domain/usecases/get-certification-result-information');

describe('Unit | Usecase | get-certification-result-information', () => {

  it('should get the certificationResultInformation', async () => {
    // given
    const certificationCourseId = 777;

    const generalCertificationInformationRepository = { get: sinon.stub() };
    const generalCertificationInformation = {};
    generalCertificationInformationRepository.get
      .withArgs({ certificationCourseId }).resolves(generalCertificationInformation);

    const assessmentResultRepository = { getAssessmentResultReadModel: sinon.stub() };
    const assessmentResult = {};
    assessmentResultRepository.getAssessmentResultReadModel
      .withArgs({ certificationCourseId }).resolves(assessmentResult);

    const cleaCertificationStatusRepository = { getCleaCertificationStatus: sinon.stub() };
    const cleaCertificationStatus = cleaStatuses.NOT_PASSED;
    cleaCertificationStatusRepository.getCleaCertificationStatus
      .withArgs(certificationCourseId).resolves(cleaCertificationStatus);

    const certificationResultInformation = Symbol('Certification result information');
    sinon.stub(CertificationResultInformation, 'from')
      .withArgs({
        generalCertificationInformation,
        assessmentResult,
        cleaCertificationStatus,
      })
      .resolves(certificationResultInformation);

    // when
    const result = await getCertificationResultInformation({
      certificationCourseId,
      generalCertificationInformationRepository,
      assessmentResultRepository,
      cleaCertificationStatusRepository,
    });

    // then
    expect(result).to.be.equal(certificationResultInformation);
  });
});

const { sinon } = require('../../../../test-helper');
const certificationService = require('../../../../../lib/domain/services/certification-service');

const certificationAssessmentRepository = require('../../../../../lib/infrastructure/repositories/certification-assessment-repository');
const certificationResultService = require('../../../../../lib/domain/services/certification-result-service');

describe('Unit | Service | Certification Service', function() {

  describe('Certification Result computations', () => {
    const certificationAssessment = Symbol('certificationAssessment');

    beforeEach(() => {
      sinon.stub(certificationAssessmentRepository, 'getByCertificationCourseId').resolves(certificationAssessment);
      sinon.stub(certificationResultService, 'getCertificationResult').resolves();
    });

    describe('#calculateCertificationResultByCertificationCourseId', () => {

      it('should call Certification Assessment Repository to get CertificationAssessment by CertificationCourseId', async () => {
        // when
        await certificationService.calculateCertificationResultByCertificationCourseId('course_id');

        // then
        sinon.assert.calledOnce(certificationAssessmentRepository.getByCertificationCourseId);
        sinon.assert.calledWith(certificationAssessmentRepository.getByCertificationCourseId, 'course_id');
      });

      it('should call CertificationResultService with appropriate arguments', async () => {
        // when
        await certificationService.calculateCertificationResultByCertificationCourseId('course_id');

        // then
        sinon.assert.calledWith(certificationResultService.getCertificationResult, {
          certificationAssessment,
          continueOnError: true,
        });
      });
    });
  });
});

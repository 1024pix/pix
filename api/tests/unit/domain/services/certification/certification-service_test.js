const { sinon, expect } = require('../../../../test-helper');
const certificationService = require('../../../../../lib/domain/services/certification-service');

const certificationAssessmentRepository = require('../../../../../lib/infrastructure/repositories/certification-assessment-repository');
const certificationResultService = require('../../../../../lib/domain/services/certification-result-service');
const cleaCertificationResultRepository = require('../../../../../lib/infrastructure/repositories/clea-certification-result-repository');
const pixPlusDroitExpertCertificationResultRepository = require('../../../../../lib/infrastructure/repositories/pix-plus-droit-expert-certification-result-repository');
const pixPlusDroitMaitreCertificationResultRepository = require('../../../../../lib/infrastructure/repositories/pix-plus-droit-maitre-certification-result-repository');
const assessementResultRepository = require('../../../../../lib/infrastructure/repositories/assessment-result-repository');
const assessementRepository = require('../../../../../lib/infrastructure/repositories/assessment-repository');

const { domainBuilder } = require('../../../../test-helper');

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
        sinon.assert.calledWith(certificationAssessmentRepository.getByCertificationCourseId, { certificationCourseId: 'course_id' });
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

    describe('#getCertificationResultByCertifCourse', () => {
      it('should call CertificationResult with correct parameters', async () => {
        // given
        const certificationCourse = domainBuilder.buildCertificationCourse({
          id: 1,
          isCancelled: true,
          firstName: 'Justine',
          lastName: 'Sagoin',
          birthdate: '2019-04-28',
          birthplace: 'Paris',
          externalId: 'EXT123',
          completedAt: new Date('2021-04-21'),
          createdAt: new Date('2021-04-20'),
          isPublished: true,
          isV2Certification: true,
          hasSeenEndTestScreen: true,
          sessionId: 456,
        });
        sinon.stub(cleaCertificationResultRepository, 'get').withArgs({ certificationCourseId: 1 }).resolves(domainBuilder.buildCleaCertificationResult.notTaken());
        sinon.stub(pixPlusDroitExpertCertificationResultRepository, 'get').withArgs({ certificationCourseId: 1 }).resolves(domainBuilder.buildPixPlusDroitCertificationResult.expert.notTaken());
        sinon.stub(pixPlusDroitMaitreCertificationResultRepository, 'get').withArgs({ certificationCourseId: 1 }).resolves(domainBuilder.buildPixPlusDroitCertificationResult.maitre.notTaken());
        sinon.stub(assessementResultRepository, 'findLatestByCertificationCourseIdWithCompetenceMarks').withArgs({ certificationCourseId: 1 }).resolves(domainBuilder.buildAssessmentResult());
        sinon.stub(assessementRepository, 'getIdByCertificationCourseId').withArgs(1).resolves(2);

        // when
        const certificationResult = await certificationService.getCertificationResultByCertifCourse({ certificationCourse });

        // then
        const expectedCertificationResult = domainBuilder.buildCertificationResult({
          lastAssessmentResult: domainBuilder.buildAssessmentResult(),
          id: 1,
          assessmentId: 2,
          firstName: 'Justine',
          lastName: 'Sagoin',
          birthdate: '2019-04-28',
          birthplace: 'Paris',
          externalId: 'EXT123',
          completedAt: new Date('2021-04-21'),
          createdAt: new Date('2021-04-20'),
          isPublished: true,
          isV2Certification: true,
          cleaCertificationResult: domainBuilder.buildCleaCertificationResult.notTaken(),
          pixPlusDroitMaitreCertificationResult: domainBuilder.buildPixPlusDroitCertificationResult.maitre.notTaken(),
          pixPlusDroitExpertCertificationResult: domainBuilder.buildPixPlusDroitCertificationResult.expert.notTaken(),
          certificationIssueReports: certificationCourse.certificationIssueReports,
          hasSeenEndTestScreen: true,
          sessionId: 456,
          isCourseCancelled: true,
        });
        expect(certificationResult).to.deep.equal(expectedCertificationResult);
      });
    });
  });
});

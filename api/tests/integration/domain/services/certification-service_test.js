const { expect, databaseBuilder } = require('../../../test-helper');
const { getCertificationResult } = require('../../../../lib/domain/services/certification-service');
const { statuses } = require('../../../../lib/infrastructure/repositories/clea-certification-status-repository');
const CertificationResult = require('../../../../lib/domain/models/CertificationResult');
const Assessment = require('../../../../lib/domain/models/Assessment');
const Badge = require('../../../../lib/domain/models/Badge');

describe('Integration | Service | certification-service', () => {
  describe('#getCertificationResult', () => {
    let certificationCourse;
    let assessment;
    let badge;
    const date = new Date();
    const hasAcquiredClea = true;

    beforeEach(async () => {
      certificationCourse = databaseBuilder.factory.buildCertificationCourse();
      assessment = databaseBuilder.factory.buildAssessment({ certificationCourseId: certificationCourse.id, type: Assessment.types.CERTIFICATION });
      badge = databaseBuilder.factory.buildBadge({ key: Badge.keys.PIX_EMPLOI_CLEA });
      databaseBuilder.factory.buildPartnerCertification({ certificationCourseId: certificationCourse.id, partnerKey: badge.key, acquired: hasAcquiredClea });

      await databaseBuilder.commit();
    });

    describe('when the certif status is not started', () => {

      beforeEach(async () => {
        databaseBuilder.factory.buildAssessmentResult({ assessmentId: assessment.id, createdAt: date });
        await databaseBuilder.commit();
      });

      it('should return certification result', async () => {
        // when
        const result = await getCertificationResult(certificationCourse.id);

        // then
        expect(result).to.be.instanceOf(CertificationResult);
        expect(result.assessmentId).to.equal(assessment.id);
        expect(result.isPublished).to.equal(certificationCourse.isPublished);
        expect(result.resultCreatedAt).to.deep.equal(date);
        expect(result.cleaCertificationStatus).to.equal(statuses.ACQUIRED);
      });
    });

    describe('when the certif status is started', () => {

      it('should return certification result with correct assessmentId', async () => {
        // when
        const result = await getCertificationResult(certificationCourse.id);

        // then
        expect(result).to.be.instanceOf(CertificationResult);
        expect(result.assessmentId).to.equal(assessment.id);
        expect(result.isPublished).to.equal(certificationCourse.isPublished);
        expect(result.cleaCertificationStatus).to.equal(statuses.ACQUIRED);
      });
    });
  });
});

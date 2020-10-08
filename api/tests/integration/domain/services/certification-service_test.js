const { expect, databaseBuilder } = require('../../../test-helper');
const { getCertificationResult } = require('../../../../lib/domain/services/certification-service');
const { statuses } = require('../../../../lib/infrastructure/repositories/clea-certification-status-repository');
const CertificationResult = require('../../../../lib/domain/models/CertificationResult');
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
      assessment = databaseBuilder.factory.buildAssessment({ certificationCourseId: certificationCourse.id });
      badge = databaseBuilder.factory.buildBadge({ key: Badge.keys.PIX_EMPLOI_CLEA });
      databaseBuilder.factory.buildPartnerCertification({ certificationCourseId: certificationCourse.id, partnerKey: badge.key, acquired: hasAcquiredClea });
      databaseBuilder.factory.buildAssessmentResult({ assessmentId: assessment.id, createdAt: date });

      await databaseBuilder.commit();
    });

    it('should return certification result', async () => {
      // when
      const result = await getCertificationResult(certificationCourse.id);

      // then
      expect(result).to.be.instanceOf(CertificationResult);
      expect(result.isPublished).to.equal(certificationCourse.isPublished);
      expect(result.resultCreatedAt).to.deep.equal(date);
      expect(result.cleaCertificationStatus).to.equal(statuses.ACQUIRED);
    });
  });
});

import * as complementaryCertificationScoringCriteriaRepository from '../../../../lib/infrastructure/repositories/complementary-certification-scoring-criteria-repository.js';
import { databaseBuilder, domainBuilder, expect } from '../../../test-helper.js';

describe('Integration | Repository | complementary certification scoring criteria', function () {
  describe('#findByCertificationCourseId', function () {
    it('should return complementary certification scoring criteria', async function () {
      // given
      databaseBuilder.factory.buildCertificationCourse({ id: 12 });
      const certificationCourse = databaseBuilder.factory.buildCertificationCourse({ id: 13 });

      const badge1 = databaseBuilder.factory.buildBadge({ key: 'PIX+_TEST1_EXPERT' });
      const badge2 = databaseBuilder.factory.buildBadge({ key: 'PIX+_TEST2_EXPERT' });

      const complementaryCertification1 = databaseBuilder.factory.buildComplementaryCertification({
        minimumReproducibilityRate: 70,
        minimumReproducibilityRateLowerLevel: 60,
        hasComplementaryReferential: true,
        key: 'REF',
      });
      const complementaryCertification2 = databaseBuilder.factory.buildComplementaryCertification({
        minimumReproducibilityRate: 75,
        minimumReproducibilityRateLowerLevel: 60,
        hasComplementaryReferential: false,
        key: 'NO_REF',
      });

      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 345,
        badgeId: badge1.id,
        complementaryCertificationId: complementaryCertification1.id,
      });

      const complementaryCertificationBadge2 = databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 768,
        badgeId: badge2.id,
        complementaryCertificationId: complementaryCertification2.id,
        minimumEarnedPix: 70,
      });

      const complementaryCertificationCourse1 = databaseBuilder.factory.buildComplementaryCertificationCourse({
        complementaryCertificationId: complementaryCertification1.id,
        certificationCourseId: certificationCourse.id,
        complementaryCertificationBadgeId: 345,
      });
      const complementaryCertificationCourse2 = databaseBuilder.factory.buildComplementaryCertificationCourse({
        complementaryCertificationId: complementaryCertification2.id,
        certificationCourseId: certificationCourse.id,
        complementaryCertificationBadgeId: 768,
      });

      databaseBuilder.factory.buildComplementaryCertificationCourse({
        certificationCourseId: 12,
        complementaryCertificationBadgeId: 768,
      });

      await databaseBuilder.commit();

      // when
      const results = await complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId({
        certificationCourseId: certificationCourse.id,
      });

      // then
      expect(results).to.deep.equal([
        domainBuilder.buildComplementaryCertificationScoringCriteria({
          complementaryCertificationCourseId: complementaryCertificationCourse1.id,
          complementaryCertificationBadgeId: complementaryCertificationCourse1.complementaryCertificationBadgeId,
          minimumReproducibilityRate: complementaryCertification1.minimumReproducibilityRate,
          minimumReproducibilityRateLowerLevel: complementaryCertification1.minimumReproducibilityRateLowerLevel,
          complementaryCertificationBadgeKey: badge1.key,
          hasComplementaryReferential: complementaryCertification1.hasComplementaryReferential,
        }),
        domainBuilder.buildComplementaryCertificationScoringCriteria({
          complementaryCertificationCourseId: complementaryCertificationCourse2.id,
          complementaryCertificationBadgeId: complementaryCertificationCourse2.complementaryCertificationBadgeId,
          minimumReproducibilityRate: complementaryCertification2.minimumReproducibilityRate,
          minimumReproducibilityRateLowerLevel: complementaryCertification2.minimumReproducibilityRateLowerLevel,
          complementaryCertificationBadgeKey: badge2.key,
          hasComplementaryReferential: complementaryCertification2.hasComplementaryReferential,
          minimumEarnedPix: complementaryCertificationBadge2.minimumEarnedPix,
        }),
      ]);
    });
  });
});

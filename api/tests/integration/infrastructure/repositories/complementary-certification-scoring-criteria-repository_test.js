import { expect, domainBuilder, databaseBuilder } from '../../../test-helper';
import complementaryCertificationScoringCriteriaRepository from '../../../../lib/infrastructure/repositories/complementary-certification-scoring-criteria-repository';

describe('Integration | Repository | complementary certification scoring criteria', function () {
  describe('#findByCertificationCourseId', function () {
    it('should return complementary certification scoring criteria', async function () {
      // given
      databaseBuilder.factory.buildCertificationCourse({ id: 12 });
      const certificationCourse = databaseBuilder.factory.buildCertificationCourse({ id: 13 });

      const badge1 = databaseBuilder.factory.buildBadge({ key: 'PIX+_TEST1_EXPERT' });
      const badge2 = databaseBuilder.factory.buildBadge({ key: 'PIX+_TEST2_EXPERT' });

      const complementaryCertification1 = databaseBuilder.factory.buildComplementaryCertification({
        minimumReproducibilityRate: 50,
        hasComplementaryReferential: true,
      });
      const complementaryCertification2 = databaseBuilder.factory.buildComplementaryCertification({
        minimumReproducibilityRate: 30,
        hasComplementaryReferential: false,
      });

      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 345,
        badgeId: badge1.id,
        complementaryCertificationId: complementaryCertification1.id,
      });

      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 768,
        badgeId: badge2.id,
        complementaryCertificationId: complementaryCertification2.id,
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

      databaseBuilder.factory.buildComplementaryCertificationCourse({ certificationCourseId: 12 });

      await databaseBuilder.commit();

      // when
      const results = await complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId({
        certificationCourseId: certificationCourse.id,
      });

      // then
      expect(results).to.deep.equal([
        domainBuilder.buildComplementaryCertificationScoringCriteria({
          complementaryCertificationCourseId: complementaryCertificationCourse1.id,
          minimumReproducibilityRate: complementaryCertification1.minimumReproducibilityRate,
          complementaryCertificationBadgeKey: badge1.key,
          hasComplementaryReferential: complementaryCertification1.hasComplementaryReferential,
        }),
        domainBuilder.buildComplementaryCertificationScoringCriteria({
          complementaryCertificationCourseId: complementaryCertificationCourse2.id,
          minimumReproducibilityRate: complementaryCertification2.minimumReproducibilityRate,
          complementaryCertificationBadgeKey: badge2.key,
          hasComplementaryReferential: complementaryCertification2.hasComplementaryReferential,
          minimumEarnedPix: complementaryCertification2.minimumEarnedPix,
        }),
      ]);
    });
  });
});

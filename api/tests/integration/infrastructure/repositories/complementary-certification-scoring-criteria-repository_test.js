const { expect, domainBuilder, databaseBuilder } = require('../../../test-helper');
const complementaryCertificationScoringCriteriaRepository = require('../../../../lib/infrastructure/repositories/complementary-certification-scoring-criteria-repository');

describe('Integration | Repository | complementary certification scoring criteria', function () {
  describe('#findByCertificationCourseId', function () {
    it('should return complementary certification scoring criteria', async function () {
      // given
      const certificationCourse = databaseBuilder.factory.buildCertificationCourse();

      const complementaryCertification1 = databaseBuilder.factory.buildComplementaryCertification({
        key: 'PIX+_TEST_1',
        label: 'label pour PIX+ TEST 1',
        minimumReproducibilityRate: 50,
      });
      const complementaryCertification2 = databaseBuilder.factory.buildComplementaryCertification({
        key: 'PIX+_TEST_2',
        label: 'label pour PIX+ TEST 2',
        minimumReproducibilityRate: 30,
      });

      const complementaryCertificationCourse1 = databaseBuilder.factory.buildComplementaryCertificationCourse({
        complementaryCertificationId: complementaryCertification1.id,
        certificationCourseId: certificationCourse.id,
      });
      const complementaryCertificationCourse2 = databaseBuilder.factory.buildComplementaryCertificationCourse({
        complementaryCertificationId: complementaryCertification2.id,
        certificationCourseId: certificationCourse.id,
      });

      const badge1 = databaseBuilder.factory.buildBadge({ key: 'PIX+_TEST1_MASTER' });
      const badge2 = databaseBuilder.factory.buildBadge({ key: 'PIX+_TEST1_EXPERT' });
      const badge3 = databaseBuilder.factory.buildBadge({ key: 'PIX+_TEST2_MASTER' });
      const badge4 = databaseBuilder.factory.buildBadge({ key: 'PIX+_TEST2_EXPERT' });

      databaseBuilder.factory.buildComplementaryCertificationBadge({
        badgeId: badge1.id,
        complementaryCertificationId: complementaryCertification1.id,
      });
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        badgeId: badge2.id,
        complementaryCertificationId: complementaryCertification1.id,
      });
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        badgeId: badge3.id,
        complementaryCertificationId: complementaryCertification2.id,
      });
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        badgeId: badge4.id,
        complementaryCertificationId: complementaryCertification2.id,
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
          minimumReproducibilityRate: complementaryCertification1.minimumReproducibilityRate,
          complementaryCertificationBadgeKeys: [badge1.key, badge2.key],
        }),
        domainBuilder.buildComplementaryCertificationScoringCriteria({
          complementaryCertificationCourseId: complementaryCertificationCourse2.id,
          minimumReproducibilityRate: complementaryCertification2.minimumReproducibilityRate,
          complementaryCertificationBadgeKeys: [badge3.key, badge4.key],
        }),
      ]);
    });
  });
});

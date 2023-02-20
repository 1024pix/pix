import { knex } from '../../../db/knex-database-connection';
import ComplementaryCertificationScoringCriteria from '../../domain/models/ComplementaryCertificationScoringCriteria';

export default {
  async findByCertificationCourseId({ certificationCourseId }) {
    const results = await knex('complementary-certification-courses')
      .select({
        complementaryCertificationCourseId: 'complementary-certification-courses.id',
        minimumReproducibilityRate: 'complementary-certifications.minimumReproducibilityRate',
        complementaryCertificationBadgeKey: 'badges.key',
        hasComplementaryReferential: 'complementary-certifications.hasComplementaryReferential',
        minimumEarnedPix: 'complementary-certifications.minimumEarnedPix',
      })
      .join(
        'complementary-certification-badges',
        'complementary-certification-badges.id',
        'complementary-certification-courses.complementaryCertificationBadgeId'
      )
      .join(
        'complementary-certifications',
        'complementary-certifications.id',
        'complementary-certification-badges.complementaryCertificationId'
      )
      .join('badges', 'badges.id', 'complementary-certification-badges.badgeId')
      .where({ certificationCourseId });

    return results.map(
      ({
        complementaryCertificationCourseId,
        minimumReproducibilityRate,
        complementaryCertificationBadgeKey,
        hasComplementaryReferential,
        minimumEarnedPix,
      }) =>
        new ComplementaryCertificationScoringCriteria({
          complementaryCertificationCourseId,
          minimumReproducibilityRate: Number(minimumReproducibilityRate),
          complementaryCertificationBadgeKey,
          hasComplementaryReferential,
          minimumEarnedPix,
        })
    );
  },
};

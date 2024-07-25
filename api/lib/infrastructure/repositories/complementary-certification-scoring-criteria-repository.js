import { knex } from '../../../db/knex-database-connection.js';
import { ComplementaryCertificationScoringCriteria } from '../../../src/shared/domain/models/ComplementaryCertificationScoringCriteria.js';

const findByCertificationCourseId = async function ({ certificationCourseId }) {
  const results = await knex('complementary-certification-courses')
    .select({
      complementaryCertificationCourseId: 'complementary-certification-courses.id',
      complementaryCertificationBadgeId: 'complementary-certification-courses.complementaryCertificationBadgeId',
      minimumReproducibilityRate: 'complementary-certifications.minimumReproducibilityRate',
      minimumReproducibilityRateLowerLevel: 'complementary-certifications.minimumReproducibilityRateLowerLevel',
      complementaryCertificationBadgeKey: 'badges.key',
      hasComplementaryReferential: 'complementary-certifications.hasComplementaryReferential',
      minimumEarnedPix: 'complementary-certification-badges.minimumEarnedPix',
    })
    .join(
      'complementary-certification-badges',
      'complementary-certification-badges.id',
      'complementary-certification-courses.complementaryCertificationBadgeId',
    )
    .join(
      'complementary-certifications',
      'complementary-certifications.id',
      'complementary-certification-badges.complementaryCertificationId',
    )
    .join('badges', 'badges.id', 'complementary-certification-badges.badgeId')
    .where({ certificationCourseId });

  return results.map(
    ({
      complementaryCertificationCourseId,
      complementaryCertificationBadgeId,
      complementaryCertificationBadgeKey,
      minimumReproducibilityRate,
      minimumReproducibilityRateLowerLevel,
      hasComplementaryReferential,
      minimumEarnedPix,
    }) =>
      new ComplementaryCertificationScoringCriteria({
        complementaryCertificationCourseId,
        complementaryCertificationBadgeId,
        complementaryCertificationBadgeKey,
        minimumReproducibilityRate: Number(minimumReproducibilityRate),
        minimumReproducibilityRateLowerLevel: Number(minimumReproducibilityRateLowerLevel),
        hasComplementaryReferential,
        minimumEarnedPix,
      }),
  );
};

export { findByCertificationCourseId };

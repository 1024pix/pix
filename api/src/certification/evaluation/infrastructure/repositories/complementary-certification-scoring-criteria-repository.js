import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { ComplementaryCertificationScoringCriteria } from '../../domain/models/ComplementaryCertificationScoringCriteria.js';

export async function findByCertificationCourseId({ certificationCourseId }) {
  const knexConn = DomainTransaction.getConnection();
  const results = await knexConn('complementary-certification-courses')
    .select({
      complementaryCertificationCourseId: 'complementary-certification-courses.id',
      complementaryCertificationBadgeId: 'complementary-certification-courses.complementaryCertificationBadgeId',
      minimumReproducibilityRate: 'complementary-certifications.minimumReproducibilityRate',
      minimumReproducibilityRateLowerLevel: 'complementary-certifications.minimumReproducibilityRateLowerLevel',
      complementaryCertificationBadgeKey: 'badges.key',
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
      minimumEarnedPix,
    }) => {
      return new ComplementaryCertificationScoringCriteria({
        complementaryCertificationCourseId,
        complementaryCertificationBadgeId,
        complementaryCertificationBadgeKey,
        minimumReproducibilityRate: Number(minimumReproducibilityRate),
        minimumReproducibilityRateLowerLevel: Number(minimumReproducibilityRateLowerLevel),
        minimumEarnedPix,
      });
    },
  );
}

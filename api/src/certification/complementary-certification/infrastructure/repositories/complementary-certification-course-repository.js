import { knex } from '../../../../../db/knex-database-connection.js';
import { ComplementaryCertificationCourseWithResults } from '../../../../../lib/domain/models/ComplementaryCertificationCourseWithResults.js';

const findByUserId = async function ({ userId }) {
  const results = await knex
    .select({
      id: 'complementary-certification-courses.id',
      hasExternalJury: 'complementary-certifications.hasExternalJury',
      complementaryCertificationBadgeId: 'targetedBadge.id',
      results: knex.raw(
        `array_agg(json_build_object(
        'id', "complementary-certification-course-results".id,
        'acquired', "complementary-certification-course-results".acquired,
        'complementaryCertificationBadgeId', "complementary-certification-course-results"."complementaryCertificationBadgeId",
        'source', "complementary-certification-course-results".source))`,
      ),
    })
    .from('complementary-certification-courses')
    .leftJoin(
      'complementary-certification-course-results',
      'complementary-certification-courses.id',
      'complementary-certification-course-results.complementaryCertificationCourseId',
    )
    .innerJoin(
      'complementary-certifications',
      'complementary-certifications.id',
      'complementary-certification-courses.complementaryCertificationId',
    )
    .innerJoin(
      'complementary-certification-badges as targetedBadge',
      'targetedBadge.id',
      'complementary-certification-courses.complementaryCertificationBadgeId',
    )
    .innerJoin(
      'complementary-certification-badges as resultBadge',
      'resultBadge.id',
      'complementary-certification-course-results.complementaryCertificationBadgeId',
    )
    .innerJoin(
      'certification-courses',
      'certification-courses.id',
      'complementary-certification-courses.certificationCourseId',
    )
    .where({ userId })
    .groupBy('hasExternalJury', 'targetedBadge.id', 'complementary-certification-courses.id')
    .orderBy('targetedBadge.id');

  if (!results.length) return [];

  return results.map(ComplementaryCertificationCourseWithResults.from);
};

export { findByUserId };

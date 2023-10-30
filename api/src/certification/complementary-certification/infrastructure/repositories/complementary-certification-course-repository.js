import { knex } from '../../../../../db/knex-database-connection.js';
import { ComplementaryCertificationCourseWithResults } from '../../../../../lib/domain/models/ComplementaryCertificationCourseWithResults.js';

const findByUserId = async function ({ userId }) {
  const results = await knex
    .select({
      id: 'complementary-certification-courses.id',
      hasExternalJury: 'complementary-certifications.hasExternalJury',
      complementaryCertificationBadgeId: 'complementaryCertificationBadgeId',
      results: knex.raw(
        `array_agg(json_build_object(
        'id', "complementary-certification-course-results".id,
        'acquired', "complementary-certification-course-results".acquired,
        'partnerKey', "complementary-certification-course-results"."partnerKey",
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
      'complementary-certification-badges',
      'complementary-certification-badges.id',
      'complementary-certification-courses.complementaryCertificationBadgeId',
    )
    .innerJoin(
      'certification-courses',
      'certification-courses.id',
      'complementary-certification-courses.certificationCourseId',
    )
    .where({ userId })
    .groupBy('hasExternalJury', 'complementaryCertificationBadgeId', 'complementary-certification-courses.id');

  if (!results.length) return [];

  return results.map(ComplementaryCertificationCourseWithResults.from);
};

export { findByUserId };

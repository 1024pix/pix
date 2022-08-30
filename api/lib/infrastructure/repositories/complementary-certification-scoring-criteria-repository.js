const { knex } = require('../../../db/knex-database-connection');
const ComplementaryCertificationScoringCriteria = require('../../domain/models/ComplementaryCertificationScoringCriteria');

module.exports = {
  async findByCertificationCourseId({ certificationCourseId }) {
    const results = await knex('complementary-certification-courses')
      .select({
        complementaryCertificationCourseId: 'complementary-certification-courses.id',
        minimumReproducibilityRate: 'complementary-certifications.minimumReproducibilityRate',
        complementaryCertificationBadgeKeys: knex.raw('json_agg("badges"."key")'),
      })
      .join(
        'complementary-certifications',
        'complementary-certifications.id',
        'complementary-certification-courses.complementaryCertificationId'
      )
      .join(
        'complementary-certification-badges',
        'complementary-certification-badges.complementaryCertificationId',
        'complementary-certifications.id'
      )
      .join('badges', 'badges.id', 'complementary-certification-badges.badgeId')
      .groupBy('complementary-certification-courses.id')
      .groupBy('complementary-certifications.id')
      .where({ certificationCourseId });

    return results.map(
      ({ complementaryCertificationCourseId, minimumReproducibilityRate, complementaryCertificationBadgeKeys }) =>
        new ComplementaryCertificationScoringCriteria({
          complementaryCertificationCourseId,
          minimumReproducibilityRate: Number(minimumReproducibilityRate),
          complementaryCertificationBadgeKeys,
        })
    );
  },
};

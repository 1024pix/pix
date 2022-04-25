const ComplementaryCertificationCourseResult = require('../../domain/models/ComplementaryCertificationCourseResult');
const { knex } = require('../bookshelf');

module.exports = {
  async getFromComplementaryCertificationCourseId({ complementaryCertificationCourseId }) {
    const complementaryCertificationCourseResults = await knex
      .select('complementary-certification-course-results.*')
      .from('complementary-certification-course-results')
      .where({ complementaryCertificationCourseId });

    return complementaryCertificationCourseResults.map((complementaryCertificationCourseResult) =>
      ComplementaryCertificationCourseResult.from({
        complementaryCertificationCourseId: complementaryCertificationCourseResult.complementaryCertificationCourseId,
        partnerKey: complementaryCertificationCourseResult.partnerKey,
        acquired: complementaryCertificationCourseResult.acquired,
        source: complementaryCertificationCourseResult.source,
      })
    );
  },

  async save({ complementaryCertificationCourseId, partnerKey, acquired, source }) {
    const existingComplementaryCertificationCourseResult = await knex('complementary-certification-course-results')
      .where({
        complementaryCertificationCourseId,
        source,
      })
      .first();

    if (existingComplementaryCertificationCourseResult) {
      return knex('complementary-certification-course-results')
        .where({
          complementaryCertificationCourseId,
          source,
        })
        .update({
          partnerKey,
          acquired,
        });
    }

    return knex('complementary-certification-course-results').insert({
      complementaryCertificationCourseId,
      partnerKey,
      acquired,
      source,
    });
  },
};

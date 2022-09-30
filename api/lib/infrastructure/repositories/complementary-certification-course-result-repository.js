const ComplementaryCertificationCourseResult = require('../../domain/models/ComplementaryCertificationCourseResult');
const { knex } = require('../../../db/knex-database-connection');

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

  async getPixSourceResultByComplementaryCertificationCourseId({ complementaryCertificationCourseId }) {
    const result = await knex
      .select('complementary-certification-course-results.*')
      .from('complementary-certification-course-results')
      .where({ complementaryCertificationCourseId, source: ComplementaryCertificationCourseResult.sources.PIX })
      .first();

    if (!result) return null;

    return ComplementaryCertificationCourseResult.from(result);
  },

  async save({ complementaryCertificationCourseId, partnerKey, acquired, source }) {
    return knex('complementary-certification-course-results')
      .insert({ partnerKey, acquired, complementaryCertificationCourseId, source })
      .onConflict(['complementaryCertificationCourseId', 'source'])
      .merge();
  },
};

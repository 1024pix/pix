const { knex } = require('../bookshelf');
const CleaCertificationResult = require('../../../lib/domain/models/CleaCertificationResult');
const { PIX_EMPLOI_CLEA_V1, PIX_EMPLOI_CLEA_V2, PIX_EMPLOI_CLEA_V3 } = require('../../domain/models/Badge').keys;

module.exports = {
  async get({ certificationCourseId }) {
    const result = await knex
      .select('acquired')
      .from('complementary-certification-course-results')
      .innerJoin(
        'complementary-certification-courses',
        'complementary-certification-courses.id',
        'complementary-certification-course-results.complementaryCertificationCourseId'
      )
      .where({ certificationCourseId })
      .whereIn('partnerKey', [PIX_EMPLOI_CLEA_V1, PIX_EMPLOI_CLEA_V2, PIX_EMPLOI_CLEA_V3])
      .first();

    if (!result) {
      return CleaCertificationResult.buildNotTaken();
    }
    return CleaCertificationResult.buildFrom(result);
  },
};

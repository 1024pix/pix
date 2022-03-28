const { knex } = require('../bookshelf');
const CleaCertificationResult = require('../../../lib/domain/models/CleaCertificationResult');
const { PIX_EMPLOI_CLEA, PIX_EMPLOI_CLEA_V2 } = require('../../domain/models/Badge').keys;

module.exports = {
  async get({ certificationCourseId }) {
    const result = await knex
      .select('acquired')
      .from('complementary-certification-course-results')
      .where({ certificationCourseId })
      .whereIn('partnerKey', [PIX_EMPLOI_CLEA, PIX_EMPLOI_CLEA_V2])
      .first();

    if (!result) {
      return CleaCertificationResult.buildNotTaken();
    }
    return CleaCertificationResult.buildFrom(result);
  },
};

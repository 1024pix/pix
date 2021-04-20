const { knex } = require('../bookshelf');
const Badge = require('../../../lib/domain/models/Badge');
const CleaCertificationResult = require('../../../lib/domain/models/CleaCertificationResult');

module.exports = {
  async get(certificationCourseId) {
    const result = await knex
      .select('acquired')
      .from('partner-certifications')
      .where({ certificationCourseId, partnerKey: Badge.keys.PIX_EMPLOI_CLEA })
      .first();

    if (!result) {
      return CleaCertificationResult.buildNotPassed();
    }
    return CleaCertificationResult.from(result);
  },
};

const { knex } = require('../bookshelf');
const CleaCertificationResult = require('../../../lib/domain/models/CleaCertificationResult');

module.exports = {
  async get({ certificationCourseId }) {
    const result = await knex
      .select('acquired')
      .from('partner-certifications')
      .where({ certificationCourseId, partnerKey: CleaCertificationResult.badgeKey })
      .first();

    if (!result) {
      return CleaCertificationResult.buildNotTaken();
    }
    return CleaCertificationResult.from(result);
  },
};

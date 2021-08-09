const { knex } = require('../bookshelf');
const CleaCertificationResult = require('../../../lib/domain/models/CleaCertificationResult');

module.exports = {
  async get({ certificationCourseId }) {
    const result = await knex
      .select('acquired')
      .from('partner-certifications')
      .where({ certificationCourseId })
      .whereIn('partnerKey', [ CleaCertificationResult.badgeKeyV1, CleaCertificationResult.badgeKeyV2 ])
      .first();

    if (!result) {
      return CleaCertificationResult.buildNotTaken();
    }
    return CleaCertificationResult.buildFrom(result);
  },
};

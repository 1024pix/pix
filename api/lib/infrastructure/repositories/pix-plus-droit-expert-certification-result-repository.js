const { knex } = require('../bookshelf');
const PixPlusDroitExpertCertificationResult = require('../../../lib/domain/models/PixPlusDroitExpertCertificationResult');

module.exports = {
  async get({ certificationCourseId }) {
    const result = await knex
      .select('acquired')
      .from('partner-certifications')
      .where({ certificationCourseId, partnerKey: PixPlusDroitExpertCertificationResult.badgeKey })
      .first();

    if (!result) {
      return PixPlusDroitExpertCertificationResult.buildNotTaken();
    }
    return PixPlusDroitExpertCertificationResult.buildFrom(result);
  },
};

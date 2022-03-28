const { knex } = require('../bookshelf');
const PixPlusDroitExpertCertificationResult = require('../../../lib/domain/models/PixPlusDroitExpertCertificationResult');
const { PIX_DROIT_EXPERT_CERTIF } = require('../../../lib/domain/models/Badge').keys;

module.exports = {
  async get({ certificationCourseId }) {
    const result = await knex
      .select('acquired')
      .from('complementary-certification-course-results')
      .where({ certificationCourseId, partnerKey: PIX_DROIT_EXPERT_CERTIF })
      .first();

    if (!result) {
      return PixPlusDroitExpertCertificationResult.buildNotTaken();
    }
    return PixPlusDroitExpertCertificationResult.buildFrom(result);
  },
};

const { knex } = require('../bookshelf');
const PixPlusDroitMaitreCertificationResult = require('../../../lib/domain/models/PixPlusDroitMaitreCertificationResult');

module.exports = {
  async get({ certificationCourseId }) {
    const result = await knex
      .select('acquired')
      .from('partner-certifications')
      .where({ certificationCourseId, partnerKey: PixPlusDroitMaitreCertificationResult.badgeKey })
      .first();

    if (!result) {
      return PixPlusDroitMaitreCertificationResult.buildNotTaken();
    }
    return PixPlusDroitMaitreCertificationResult.from(result);
  },
};

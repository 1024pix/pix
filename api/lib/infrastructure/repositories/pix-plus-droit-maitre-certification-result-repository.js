const { knex } = require('../bookshelf');
const PixPlusDroitMaitreCertificationResult = require('../../../lib/domain/models/PixPlusDroitMaitreCertificationResult');
const { PIX_DROIT_MAITRE_CERTIF } = require('../../../lib/domain/models/Badge').keys;

module.exports = {
  async get({ certificationCourseId }) {
    const result = await knex
      .select('acquired')
      .from('partner-certifications')
      .where({ certificationCourseId, partnerKey: PIX_DROIT_MAITRE_CERTIF })
      .first();

    if (!result) {
      return PixPlusDroitMaitreCertificationResult.buildNotTaken();
    }
    return PixPlusDroitMaitreCertificationResult.buildFrom(result);
  },
};

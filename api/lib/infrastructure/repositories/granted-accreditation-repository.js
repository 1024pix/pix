const { knex } = require('../bookshelf');

module.exports = {
  async save(grantedAccreditation) {
    const columnsToSave = {
      accreditationId: grantedAccreditation.accreditationId,
      certificationCenterId: grantedAccreditation.certificationCenterId,
    };
    return await knex('granted-accreditations')
      .insert(columnsToSave)
      .returning('id');
  },

  async deleteByCertificationCenterId(certificationCenterId) {
    return await knex('granted-accreditations')
      .delete()
      .where({ certificationCenterId })
      .returning('id');
  },
};

const { knex } = require('../bookshelf');

module.exports = {
  async save(grantedAccreditation) {
    const columnsToSave = {
      complementaryCertificationId: grantedAccreditation.accreditationId,
      certificationCenterId: grantedAccreditation.certificationCenterId,
    };
    return await knex('complementary-certification-habilitations').insert(columnsToSave).returning('id');
  },

  async deleteByCertificationCenterId(certificationCenterId) {
    return await knex('complementary-certification-habilitations')
      .delete()
      .where({ certificationCenterId })
      .returning('id');
  },
};

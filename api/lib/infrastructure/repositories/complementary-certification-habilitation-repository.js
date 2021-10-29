const { knex } = require('../bookshelf');

module.exports = {
  async save(complementaryCertification) {
    const columnsToSave = {
      complementaryCertificationId: complementaryCertification.complementaryCertificationId,
      certificationCenterId: complementaryCertification.certificationCenterId,
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

const { knex } = require('../../../db/knex-database-connection');

module.exports = {
  async save(complementaryCertification) {
    const columnsToSave = {
      complementaryCertificationId: complementaryCertification.complementaryCertificationId,
      certificationCenterId: complementaryCertification.certificationCenterId,
    };
    return knex('complementary-certification-habilitations').insert(columnsToSave);
  },

  async deleteByCertificationCenterId(certificationCenterId) {
    return knex('complementary-certification-habilitations').delete().where({ certificationCenterId });
  },
};

import { knex } from '../../../db/knex-database-connection.js';

const COMPLEMENTARY_CERTIFICATION_HABILITATIONS_TABLE_NAME = 'complementary-certification-habilitations';

const save = async function (complementaryCertification) {
  const columnsToSave = {
    complementaryCertificationId: complementaryCertification.complementaryCertificationId,
    certificationCenterId: complementaryCertification.certificationCenterId,
  };
  return knex(COMPLEMENTARY_CERTIFICATION_HABILITATIONS_TABLE_NAME).insert(columnsToSave);
};

const deleteByCertificationCenterId = async function (certificationCenterId) {
  return knex(COMPLEMENTARY_CERTIFICATION_HABILITATIONS_TABLE_NAME).delete().where({ certificationCenterId });
};

export { deleteByCertificationCenterId, save };

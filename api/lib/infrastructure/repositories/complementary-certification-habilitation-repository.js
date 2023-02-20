import { knex } from '../../../db/knex-database-connection';

const COMPLEMENTARY_CERTIFICATION_HABILITATIONS_TABLE_NAME = 'complementary-certification-habilitations';

export default {
  async save(complementaryCertification) {
    const columnsToSave = {
      complementaryCertificationId: complementaryCertification.complementaryCertificationId,
      certificationCenterId: complementaryCertification.certificationCenterId,
    };
    return knex(COMPLEMENTARY_CERTIFICATION_HABILITATIONS_TABLE_NAME).insert(columnsToSave);
  },

  async deleteByCertificationCenterId(certificationCenterId) {
    return knex(COMPLEMENTARY_CERTIFICATION_HABILITATIONS_TABLE_NAME).delete().where({ certificationCenterId });
  },

  async findByCertificationCenterId(certificationCenterId) {
    return knex(COMPLEMENTARY_CERTIFICATION_HABILITATIONS_TABLE_NAME)
      .select([
        'complementary-certifications.id',
        'complementary-certifications.key',
        'complementary-certifications.label',
      ])
      .join(
        'complementary-certifications',
        'complementary-certifications.id',
        `${COMPLEMENTARY_CERTIFICATION_HABILITATIONS_TABLE_NAME}.complementaryCertificationId`
      )
      .where(`${COMPLEMENTARY_CERTIFICATION_HABILITATIONS_TABLE_NAME}.certificationCenterId`, certificationCenterId);
  },
};

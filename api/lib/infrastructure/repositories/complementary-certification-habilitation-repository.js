import { DomainTransaction } from '../DomainTransaction.js';

const COMPLEMENTARY_CERTIFICATION_HABILITATIONS_TABLE_NAME = 'complementary-certification-habilitations';

const save = async function (complementaryCertification) {
  const knexConn = DomainTransaction.getConnection();
  const columnsToSave = {
    complementaryCertificationId: complementaryCertification.complementaryCertificationId,
    certificationCenterId: complementaryCertification.certificationCenterId,
  };
  return knexConn(COMPLEMENTARY_CERTIFICATION_HABILITATIONS_TABLE_NAME).insert(columnsToSave);
};

const deleteByCertificationCenterId = async function (certificationCenterId) {
  const knexConn = DomainTransaction.getConnection();
  return knexConn(COMPLEMENTARY_CERTIFICATION_HABILITATIONS_TABLE_NAME).delete().where({ certificationCenterId });
};

export { deleteByCertificationCenterId, save };

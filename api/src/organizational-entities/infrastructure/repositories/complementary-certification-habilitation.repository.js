// @ts-check
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';

const COMPLEMENTARY_CERTIFICATION_HABILITATIONS_TABLE_NAME = 'complementary-certification-habilitations';

/**
 * @typedef {import('../../domain/model/ComplementaryCertificationHabilitation.js').ComplementaryCertificationHabilitation} ComplementaryCertificationHabilitation
 */

/**
 * @function
 * @param {ComplementaryCertificationHabilitation} complementaryCertificationHabilitation
 * @returns {Promise<number>}
 */
const save = async function (complementaryCertificationHabilitation) {
  const knexConn = DomainTransaction.getConnection();
  const columnsToSave = {
    complementaryCertificationId: complementaryCertificationHabilitation.complementaryCertificationId,
    certificationCenterId: complementaryCertificationHabilitation.certificationCenterId,
  };
  return knexConn(COMPLEMENTARY_CERTIFICATION_HABILITATIONS_TABLE_NAME).insert(columnsToSave);
};

/**
 * @function
 * @param {number} certificationCenterId
 * @returns {Promise<number>}
 */
const deleteByCertificationCenterId = async function (certificationCenterId) {
  const knexConn = DomainTransaction.getConnection();
  return knexConn(COMPLEMENTARY_CERTIFICATION_HABILITATIONS_TABLE_NAME).delete().where({ certificationCenterId });
};

export { deleteByCertificationCenterId, save };

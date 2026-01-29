import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { ComplementaryCertificationForTargetProfileAttachment } from '../../domain/models/ComplementaryCertificationForTargetProfileAttachment.js';

function _toDomain(row) {
  return new ComplementaryCertificationForTargetProfileAttachment(row);
}

const getById = async function ({ complementaryCertificationId }) {
  const knexConn = DomainTransaction.getConnection();
  const complementaryCertification = await knexConn
    .from('complementary-certifications')
    .where({ id: complementaryCertificationId })
    .first();

  if (!complementaryCertification) {
    throw new NotFoundError('The complementary certification does not exist');
  }

  return _toDomain(complementaryCertification);
};

/**
 * @function
 * @param {object} params
 * @param {string} params.complementaryCertificationKey
 *
 * @returns {Promise<ComplementaryCertificationForTargetProfileAttachment>}
 * @throws {NotFoundError}
 */
const getByKey = async function ({ complementaryCertificationKey }) {
  const knexConn = DomainTransaction.getConnection();
  const complementaryCertification = await knexConn
    .from('complementary-certifications')
    .where({ key: complementaryCertificationKey })
    .first();

  if (!complementaryCertification) {
    throw new NotFoundError('The complementary certification does not exist');
  }

  return _toDomain(complementaryCertification);
};

export { getById, getByKey };

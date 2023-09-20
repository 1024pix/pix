import { ComplementaryCertificationForTargetProfileAttachment } from '../../domain/models/ComplementaryCertificationForTargetProfileAttachment.js';
import { knex } from '../../../../../db/knex-database-connection.js';
import { NotFoundError } from '../../../../../lib/domain/errors.js';

function _toDomain(row) {
  return new ComplementaryCertificationForTargetProfileAttachment(row);
}

const getById = async function ({ complementaryCertificationId }) {
  const complementaryCertification = await knex
    .from('complementary-certifications')
    .where({ id: complementaryCertificationId })
    .first();

  if (!complementaryCertification) {
    throw new NotFoundError('The complementary certification does not exist');
  }

  return _toDomain(complementaryCertification);
};

export { getById };

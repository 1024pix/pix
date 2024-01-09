import { knex } from '../../../../../db/knex-database-connection.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { Center } from '../../domain/models/Center.js';

const getById = async ({ id }) => {
  const certificationCenter = await knex.from('certification-centers').where({ id }).first();
  if (!certificationCenter) {
    throw new NotFoundError(`Certification center not found`);
  }
  return _toDomain(certificationCenter);
};

export { getById };

function _toDomain(row) {
  return new Center({
    ...row,
  });
}

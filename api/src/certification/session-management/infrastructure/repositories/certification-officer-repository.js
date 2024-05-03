import { knex } from '../../../../../db/knex-database-connection.js';
import { UserNotFoundError } from '../../../../../lib/domain/errors.js';
import { CertificationOfficer } from '../../domain/models/CertificationOfficer.js';

const get = async function ({ userId }) {
  const certificationOfficer = await knex('users')
    .select(['id', 'firstName', 'lastName'])
    .where({ id: userId })
    .first();

  if (!certificationOfficer) {
    throw new UserNotFoundError(`User not found for ID ${userId}`);
  }
  return _toDomain(certificationOfficer);
};

export { get };

function _toDomain(certificationOfficer) {
  return new CertificationOfficer(certificationOfficer);
}

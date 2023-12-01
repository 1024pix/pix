import { UserNotFoundError } from '../../../../../lib/domain/errors.js';
import { CertificationOfficer } from '../../domain/models/CertificationOfficer.js';
import { knex } from '../../../../../db/knex-database-connection.js';

const get = async function (certificationOfficerId) {
  const certificationOfficer = await knex('users')
    .select(['id', 'firstName', 'lastName'])
    .where({ id: certificationOfficerId })
    .first();

  if (!certificationOfficer) {
    throw new UserNotFoundError(`User not found for ID ${certificationOfficerId}`);
  }
  return _toDomain(certificationOfficer);
};

export { get };

function _toDomain(certificationOfficer) {
  return new CertificationOfficer(certificationOfficer);
}

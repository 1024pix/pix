import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { UserNotFoundError } from '../../../../shared/domain/errors.js';
import { CertificationOfficer } from '../../domain/models/CertificationOfficer.js';

export async function get({ userId }) {
  const knexConn = DomainTransaction.getConnection();

  const certificationOfficer = await knexConn('users')
    .select(['id', 'firstName', 'lastName'])
    .where({ id: userId })
    .first();

  if (!certificationOfficer) {
    throw new UserNotFoundError(`User not found for ID ${userId}`);
  }
  return _toDomain(certificationOfficer);
}

function _toDomain(certificationOfficer) {
  return new CertificationOfficer(certificationOfficer);
}
